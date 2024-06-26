import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessAuthGuard } from '../utils/jwt/access/access.auth-guard';
import { Jwt } from '../utils/decorator/jwt-payload';
import { RefreshAuthGuard } from '../utils/jwt/refresh/refresh-auth-guard.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('get_refresh_token')
  async getRefreshToken(
    @Body('accessToken') accessToken: string, // accessToken of google sign in
  ): Promise<any> {
    const refreshToken = await this.userService.getRefreshToken(accessToken);
    return {
      refreshToken: refreshToken,
    };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('get_access_token')
  async getAccessToken(
    @Jwt() jwt,
    @Body('accessToken') accessToken: string, // accessToken of google sign in
  ): Promise<any> {
    return {
      accessToken: await this.userService.getAccessToken(
        jwt.userPk,
        accessToken,
      ),
    };
  }

  @UseGuards(AccessAuthGuard)
  @Post('update_tags')
  async updateTags(@Jwt() jwt, @Body('tags') tags: string[]): Promise<any> {
    await this.userService.updateTags(jwt.userPk, tags);
  }

  @UseGuards(AccessAuthGuard)
  @Get('get_tags')
  async getTags(@Jwt() jwt): Promise<any> {
    return await this.userService.getTags(jwt.userPk);
  }

  @UseGuards(AccessAuthGuard)
  @Post('update_title_header')
  async updateTitleHeader(@Jwt() jwt, @Body('txt') txt: string): Promise<any> {
    await this.userService.updateTitleHeader(jwt.userPk, txt);
  }

  @UseGuards(AccessAuthGuard)
  @Get('get_title_header')
  async getTitleHeader(@Jwt() jwt): Promise<any> {
    return await this.userService.getTitleHeader(jwt.userPk);
  }

  @UseGuards(AccessAuthGuard)
  @Post('update_description_header')
  async updateDescriptionHeader(
    @Jwt() jwt,
    @Body('txt') txt: string,
  ): Promise<any> {
    await this.userService.updateDescriptionHeader(jwt.userPk, txt);
  }

  @UseGuards(AccessAuthGuard)
  @Get('get_description_header')
  async getDescriptionHeader(@Jwt() jwt): Promise<any> {
    return await this.userService.getDescriptionHeader(jwt.userPk);
  }
  @UseGuards(AccessAuthGuard)
  @Post('update_youtube_api_key')
  async updateYoutubeApiKey(@Jwt() jwt, @Body('key') key: string) {
    await this.userService.updateYoutubeApiKey(jwt.userPk, key);
  }

  @UseGuards(AccessAuthGuard)
  @Get('get_youtube_api_key')
  async getYoutubeApiKey(@Jwt() jwt): Promise<any> {
    return await this.userService.getYoutubeApiKey(jwt.userPk);
  }

  @UseGuards(AccessAuthGuard)
  @Post('update_open_ai_api_key')
  async updateOpenAiKey(@Jwt() jwt, @Body('key') key: string): Promise<any> {
    await this.userService.updateOpenAiApiKey(jwt.userPk, key);
  }

  @UseGuards(AccessAuthGuard)
  @Get('get_open_ai_api_key')
  async getOpenAiKey(@Jwt() jwt): Promise<any> {
    return await this.userService.getOpenAiApiKey(jwt.userPk);
  }
}
