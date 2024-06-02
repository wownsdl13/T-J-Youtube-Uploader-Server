import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AccessAuthGuard } from '../utils/jwt/access/access.auth-guard';
import { Jwt } from '../utils/decorator/jwt-payload';
import { SubtitleService } from './subtitle.service';
import { SubtitleDto } from './dto/subtitle.dto';
import { GetSubtitleDirection } from '../enum/get.subtitle-direction';
import * as archiver from 'archiver';
import { Response } from 'express';
import { MergeAudioDto } from './dto/merge-audio.dto';

@Controller('subtitle')
export class SubtitleController {
  constructor(private readonly subtitleService: SubtitleService) {}
  @UseGuards(AccessAuthGuard)
  @Post('upload_subtitle')
  async uploadSubtitle(
    @Jwt() jwt,
    @Body() subtitleDto: SubtitleDto,
  ): Promise<any> {
    await this.subtitleService.uploadSubtitle(subtitleDto);
  }

  @UseGuards(AccessAuthGuard)
  @Get('get_subtitle')
  async getSubtitle(
    @Query('pk') pk: string,
    @Query('getSubtitleDirection') getSubtitleDirection: GetSubtitleDirection,
  ) {
    return await this.subtitleService.getSubtitle(pk, getSubtitleDirection);
  }

  @UseGuards(AccessAuthGuard)
  @Delete('delete_subtitle')
  async deleteSubtitle(@Body('pk') pk: string) {
    return await this.subtitleService.deleteSubtitle(pk);
  }

  // @UseGuards(AccessAuthGuard)
  // @Post('get_audio')
  // async getAudio(@Body('textList') textList: string[], @Res() res: Response) {
  //   const zip = archiver('zip', {
  //     zlib: { level: 9 }, // 최대 압축 레벨
  //   });
  //   res.setHeader('Content-Type', 'application/zip');
  //   res.setHeader('Content-Disposition', 'attachment; filename=TTS_files.zip');
  //
  //   zip.pipe(res);
  //
  //   for (let i = 0; i < textList.length; i++) {
  //     const audioBuffer = await this.subtitleService.getAudio(textList[i]);
  //     zip.append(audioBuffer, { name: `${i + 1} - TTS.mp3` });
  //   }
  //   await zip.finalize();
  // }

  @UseGuards(AccessAuthGuard)
  @Post('get_audio')
  async getAudio(
    @Body('srtList') srtList: MergeAudioDto[],
    @Res() res: Response,
  ) {
    console.log('tets > ' + JSON.stringify(srtList));
    const audioBuffer = await this.subtitleService.processAudioRequests(
      srtList,
    );
    res.set({
      'Content-Type': 'audio/mp3',
      'Content-Disposition': 'attachment; filename="TTS-audio.mp3"',
      'Content-Length': audioBuffer.length,
    });
    res.send(audioBuffer);
  }
}
