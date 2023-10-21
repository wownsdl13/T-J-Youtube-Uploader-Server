import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user';
import { DataSource, Repository } from 'typeorm';
import { UserTag } from '../entities/user.tag';
import { JwtService } from '@nestjs/jwt';
import { AxiosResponse } from 'axios/index';
import axios from 'axios';

@Injectable()
export class YoutubeService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserTag)
    private readonly userTagRepository: Repository<UserTag>,
    private readonly jwtService: JwtService,
    private dataSource: DataSource,
  ) {}
  private readonly youtube = google.youtube('v3');
  async uploadCaption(
    videoId: string,
    language: string,
    srt: string,
    oAuthToken: string,
  ) {
    const captionResource = {
      snippet: {
        videoId: videoId,
        language: language,
        name: 'lang-' + language, // 예: 'English captions'
        isDraft: false,
      },
    };

    const response = await this.youtube.captions.update({
      oauth_token: oAuthToken,
      part: ['snippet'],
      requestBody: captionResource,
      media: {
        mimeType: 'text/srt',
        body: srt, // 여기에 실제 자막 데이터(예: SRT 파일 내용)를 제공합니다.
      },
    });
    return response.data;
  }

  async uploadThumbnail(
    id: string,
    videoId: string,
    thumbnail: Buffer,
    oAuthToken: string,
  ): Promise<AxiosResponse> {
    // console.log(`..111 > ${thumbnail}`);
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      const url = `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}&key=${user.youtubeApiKey}`;
      try {
        // HTTP POST 요청을 통해 YouTube API로 썸네일 업로드
        return await axios.post(
          url,
          thumbnail, // 썸네일 데이터 (이진 데이터)
          {
            headers: {
              Authorization: `Bearer ${oAuthToken}`,
              'Content-Type': 'image/jpeg',
            },
          },
        );
      } catch (error) {
        throw new Error('Failed to set thumbnail: ' + error.message);
      }
    }
  }

  async postComment(oAuthToken: string, videoId: string, text: string) {
    try {
      // You should modify the "part" parameter based on your needs, refer to the YouTube Data API documentation for more details
      const response = await this.youtube.commentThreads.insert({
        oauth_token: oAuthToken,
        part: ['snippet'],
        requestBody: {
          snippet: {
            videoId: videoId,
            topLevelComment: {
              snippet: {
                textOriginal: text,
              },
            },
          },
        },
      });
      return response.data;
    } catch (error) {
      // Handle error accordingly
      console.error(error);
      throw error;
    }
  }

  async setVideoLocalizations(
    id: string,
    videoId: string,
    localizations: Record<string, any>,
    oAuthToken: string,
  ): Promise<AxiosResponse<any>> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=localizations&key=${user.youtubeApiKey}`;
      try {
        return await axios.put(
          url,
          {
            id: videoId,
            localizations: localizations,
          },
          {
            headers: {
              Authorization: `Bearer ${oAuthToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('..33');
      } catch (error) {
        // 오류 처리 (예: 로깅, 오류 메시지 반환)
        console.log('error > ' + error);
        throw error;
      }
    }
  }
}
