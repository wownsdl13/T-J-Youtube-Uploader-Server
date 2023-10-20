import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user';
import { UserTag } from '../entities/user.tag';
import { AccessStrategy } from '../utils/jwt/access/access.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, UserTag]),
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService, AccessStrategy],
})
export class YoutubeModule {}
