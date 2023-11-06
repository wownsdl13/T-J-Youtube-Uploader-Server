import {
  Body,
  Controller,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessAuthGuard } from '../utils/jwt/access/access.auth-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Jwt } from '../utils/decorator/jwt-payload';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @UseGuards(AccessAuthGuard)
  @Put('upload_caption')
  async uploadCaption(
    @Body('videoId') videoId: string,
    @Body('language') language: string,
    @Body('srt') srt: string,
    @Body('oAuthToken') oAuthToken: string,
  ) {
    return {
      location: await this.youtubeService.uploadCaption(
        videoId,
        language,
        srt,
        oAuthToken,
      ),
    };
  }

  @UseGuards(AccessAuthGuard)
  @Post('upload_thumbnail')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async uploadThumbnail(
    @UploadedFile() file,
    @Jwt() jwt,
    @Body('oAuthToken') oAuthToken: string,
    @Body('videoId') videoId: string,
  ) {
    try {
      const response = await this.youtubeService.uploadThumbnail(
        jwt.userPk,
        videoId,
        file.buffer,
        oAuthToken,
      );
      return response.data;
    } catch (error) {
      // 에러 처리
      return { error: error.message };
    }
  }

  @UseGuards(AccessAuthGuard)
  @Put('post_comment')
  async postComment(
    @Body('oAuthToken') oAuthToken: string,
    @Body('videoId') videoId: string,
    @Body('text') text: string,
  ) {
    await this.youtubeService.postComment(oAuthToken, videoId, text);
  }

  @UseGuards(AccessAuthGuard)
  @Post('set_video_localizations')
  async setVideoLocalizations(
    @Jwt() jwt,
    @Body('oAuthToken') oAuthToken: string,
    @Body('videoId') videoId: string,
    @Body('localizations') localizations: any,
  ) {
    await this.youtubeService.setVideoLocalizations(
      jwt.userPk,
      videoId,
      localizations,
      oAuthToken,
    );
  }

  @UseGuards(AccessAuthGuard)
  @Post('translate_text')
  async translateText(
    @Jwt() jwt,
    @Body('text') text: string,
    @Body('targetLanguage') targetLanguage: string,
  ) {
    return await this.youtubeService.translateText(
      jwt.userPk,
      text,
      targetLanguage,
    );
  }
}
