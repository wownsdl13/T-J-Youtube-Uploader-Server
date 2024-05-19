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
    const captionsList = await this.youtube.captions.list({
      part: ['snippet'],
      videoId: videoId,
      oauth_token: oAuthToken,
    });

    // 원하는 언어의 자막이 있는지 확인합니다.
    const existingCaption = captionsList.data.items.find(
      (caption) => caption.snippet.language === language,
    );

    const captionResource: any = {
      snippet: {
        videoId: videoId,
        language: language,
        name: '', // 예: 'English captions'
        isDraft: false,
      },
    };
    if (existingCaption) {
      captionResource.id = existingCaption.id;
    }
    const params = {
      oauth_token: oAuthToken,
      part: ['snippet'],
      requestBody: captionResource,
      media: {
        mimeType: 'text/srt',
        body: srt, // 여기에 실제 자막 데이터(예: SRT 파일 내용)를 제공합니다.
      },
    };
    if (existingCaption) {
      const response = await this.youtube.captions.update(params);
      return response.data;
    } else {
      const response = await this.youtube.captions.insert(params);
      return response.data;
    }
  }

  async uploadThumbnail(
    id: string,
    videoId: string,
    thumbnail: Buffer,
    oAuthToken: string,
  ): Promise<AxiosResponse> {
    console.log(`..111 > `);
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
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  }

  async setVideoLocalizations(
    id: string,
    videoId: string,
    localizations: Record<string, any>,
    oAuthToken: string,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      try {
        const response = await this.youtube.videos.update({
          part: ['localizations'],
          requestBody: {
            id: videoId,
            localizations: localizations,
            // 'snippet'은 선택적이며, 기본 언어나 다른 필드를 업데이트해야 할 때 포함합니다.
          },
          // OAuth 2.0를 사용하여 요청을 인증합니다.
          oauth_token: oAuthToken,
        });
      } catch (error) {
        // 오류 처리 (예: 로깅, 오류 메시지 반환)
        console.log('error > ' + error);
        if (error.response) {
          console.error('Error data:', error.response.data);
          console.error('Error status:', error.response.status);
        }
        throw error;
      }
    }
  }
}
