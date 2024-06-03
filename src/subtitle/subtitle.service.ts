import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Subtitle } from '../entities/subtitle';
import { InjectRepository } from '@nestjs/typeorm';
import { SubtitleOne } from '../entities/subtitle.one';
import { SubtitleDto } from './dto/subtitle.dto';
import { SubtitleOneTranslate } from '../entities/subtitle.one-translate';
import { GetSubtitleDirection } from '../enum/get.subtitle-direction';
import * as ffmpeg from 'fluent-ffmpeg';

import * as path from 'path';
import * as fs from 'fs';

import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { MergeAudioDto } from './dto/merge-audio.dto';

@Injectable()
export class SubtitleService {
  private polly: AWS.Polly;
  constructor(
    private configService: ConfigService,
    @InjectRepository(Subtitle)
    private readonly subtitleRepository: Repository<Subtitle>,
    @InjectRepository(SubtitleOne)
    private readonly subtitleOneRepository: Repository<SubtitleOne>,
    private dataSource: DataSource,
  ) {
    this.polly = new AWS.Polly({
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async uploadSubtitle(subtitleDto: SubtitleDto) {
    const pk = subtitleDto.pk;
    console.log(`pk > ${pk}`);
    await this.dataSource.transaction(async (tem) => {
      const subtitle = await tem.findOne(Subtitle, {
        where: {
          pk: pk,
        },
      });

      if (!subtitle) {
        const subtitle = new Subtitle();
        subtitle.pk = pk;
        subtitle.createTime = Date.now();
        await tem.save(Subtitle, subtitle);
      }

      const subtitles = subtitleDto.subtitles;
      for (const s of subtitles) {
        const onePk = `${pk}-${s.order}`;
        const order = s.order;
        const period = s.period;
        const subtitleOneType = s.subtitleOneType;
        const old = await tem.findOne(SubtitleOne, {
          where: {
            pk: onePk,
          },
        });
        if (!old) {
          const one = new SubtitleOne();
          one.pk = onePk;
          one.subtitlePk = pk;
          one.order = order;
          one.period = period;
          one.subtitleOneType = subtitleOneType;
          await tem.save(SubtitleOne, one);
        } else {
          await tem.update(SubtitleOne, onePk, {
            subtitleOneType: subtitleOneType,
          });
        }

        const translations = s.translations;
        for (const languageCode in translations) {
          if (translations.hasOwnProperty(languageCode)) {
            const oneTranslatePk = `${onePk}-${languageCode}`;
            const text = translations[languageCode];
            const old = await tem.findOne(SubtitleOneTranslate, {
              where: {
                pk: oneTranslatePk,
              },
            });
            if (old) {
              await tem.update(SubtitleOneTranslate, pk, {
                text: text,
              });
            } else {
              const subtitleOneTranslate = new SubtitleOneTranslate();
              subtitleOneTranslate.pk = oneTranslatePk;
              subtitleOneTranslate.languageCode = languageCode;
              subtitleOneTranslate.text = text;
              subtitleOneTranslate.subtitleOnePk = onePk;
              await tem.save(SubtitleOneTranslate, subtitleOneTranslate);
            }
          }
        }
      }
    });
  }

  async getSubtitle(
    pk: string,
    direction: GetSubtitleDirection,
  ): Promise<Subtitle | null> {
    const old = await this.subtitleRepository
      .createQueryBuilder()
      .where('pk = :pk', { pk })
      .getOne();
    if (old) {
      let order: 'ASC' | 'DESC' = 'DESC';
      let comparison = '<';
      if (direction === GetSubtitleDirection.previous) {
        order = 'ASC';
        comparison = '>';
      }
      const createTime = old.createTime;
      const nextOne = await this.subtitleRepository
        .createQueryBuilder('subtitle')
        .leftJoinAndSelect('subtitle.subtitles', 'subtitleOne')
        .leftJoinAndSelect(
          'subtitleOne.subtitleOneTranslates',
          'subtitleOneTranslate',
        )
        .where('subtitle.pk != :pk', { pk })
        .andWhere(`subtitle.createTime ${comparison} :createTime`, {
          createTime,
        })
        .orderBy('subtitle.createTime', order)
        .orderBy('subtitleOne.order', 'ASC')
        .getOne();
      if (nextOne) {
        return nextOne;
      }
      return null;
    }
    const currentOne = await this.subtitleRepository
      .createQueryBuilder('subtitle')
      .leftJoinAndSelect('subtitle.subtitles', 'subtitleOne')
      .leftJoinAndSelect(
        'subtitleOne.subtitleOneTranslates',
        'subtitleOneTranslate',
      )
      .orderBy('subtitle.createTime', 'DESC')
      .orderBy('subtitleOne.order', 'ASC')
      .getOne();
    if (currentOne) {
      return currentOne;
    }
    return null;
  }

  async deleteSubtitle(pk: string) {
    return await this.subtitleRepository.delete(pk);
  }

  async getAudio(text: string): Promise<Buffer> {
    const ssmlText = `
    <speak>
        ${text}
    </speak>
  `;
    console.log(`TTS > ${text}`);
    const params = {
      OutputFormat: 'mp3',
      Text: ssmlText,
      VoiceId: 'Matthew',
      Engine: 'generative',
      TextType: 'ssml',
    };
    const result = await this.polly.synthesizeSpeech(params).promise();
    return result.AudioStream as Buffer;
  }

  async synthesizeSpeech(text: string, outputPath: string): Promise<void> {
    const ssmlText = `
    <speak>
        ${text}
    </speak>
  `;
    console.log(`TTS > ${text}`);
    const params = {
      OutputFormat: 'mp3',
      Text: ssmlText,
      VoiceId: 'Matthew',
      Engine: 'generative',
      TextType: 'ssml',
    };
    const response = await this.polly.synthesizeSpeech(params).promise();
    fs.writeFileSync(outputPath, response.AudioStream as Buffer);
  }

  async processAudioRequests(srtList: MergeAudioDto[]): Promise<Buffer> {
    const audioFiles: string[] = [];
    const periods: string[] = [];

    for (const request of srtList) {
      const outputPath = path.join(
        __dirname,
        `audio_${srtList.indexOf(request)}.mp3`,
      );
      await this.synthesizeSpeech(request.text, outputPath);
      console.log(`text TTS > ${request.text}`);
      audioFiles.push(outputPath);
      periods.push(request.period);
    }

    const mergedFilePath = await this.mergeAudioFiles(audioFiles, periods);
    console.log(`path > ${mergedFilePath}`);

    // Clean up individual files
    audioFiles.forEach((file) => fs.unlinkSync(file));

    return fs.readFileSync(mergedFilePath);
  }

  async mergeAudioFiles(
    audioFiles: string[],
    periods: string[],
  ): Promise<string> {
    const mergedFilePath = path.join(__dirname, 'merged-audio.mp3');

    console.time('mergeAudio');
    const command = ffmpeg();

    // Add input files to the command
    audioFiles.forEach((file) => {
      console.log(`file!-${file}`);
      command.input(file);
    });

    // Get durations of all audio files
    const durations = await Promise.all(
      audioFiles.map((file) => this.getAudioDuration(file)),
    );

    let previousEnd = 0;
    const filterComplexArgs =
      audioFiles
        .map((file, index) => {
          const period = periods[index].split(' --> ');
          const start = this.convertToSeconds(period[0]) * 1000; // Convert to milliseconds
          let delay = start - previousEnd;
          // if delay is negative, then just put 0
          if (delay < 0) {
            delay = 0;
          }
          previousEnd = start + durations[index];
          return `[${index}:0]adelay=${delay}|${delay}[a${index}]`;
        })
        .join('; ') +
      `; ` +
      audioFiles.map((_, index) => `[a${index}]`).join('') +
      `concat=n=${audioFiles.length}:v=0:a=1[outa]`;

    // Configure ffmpeg command
    command
      .complexFilter([filterComplexArgs])
      .outputOptions('-map', '[outa]')
      .output(mergedFilePath)
      .audioBitrate('192k') // Set bitrate to 192 kbps
      .audioFrequency(44100) // Set sample rate to 44.1 kHz
      .audioCodec('libmp3lame') // Ensure MP3 codec is used
      .on('end', () => {
        console.timeEnd('mergeAudio');
        console.log('Merging finished!');
      })
      .on('error', (err, stdout, stderr) => {
        console.timeEnd('mergeAudio');
        console.log('Error: ' + err.message);
        console.log('ffmpeg stdout: ' + stdout);
        console.log('ffmpeg stderr: ' + stderr);
      });

    return new Promise((resolve, reject) => {
      command
        .on('end', () => {
          console.timeEnd('mergeAudio');
          console.log('Merging finished!');
          resolve(mergedFilePath);
        })
        .on('error', (err) => {
          console.timeEnd('mergeAudio');
          console.error('Error merging audio files:', err);
          reject(err);
        })
        .run();
    });
  }

  private convertToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(':');
    const [secs, ms] = seconds.split(',');
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(secs) +
      parseInt(ms) / 1000
    );
  }

  private async getAudioDuration(file: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(file, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration * 1000); // Convert to milliseconds
        }
      });
    });
  }
}
