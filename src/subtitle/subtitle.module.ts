import { Module } from '@nestjs/common';
import { SubtitleController } from './subtitle.controller';
import { SubtitleService } from './subtitle.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subtitle } from '../entities/subtitle';
import { SubtitleOne } from '../entities/subtitle.one';
import { SubtitleOneTranslate } from '../entities/subtitle.one-translate';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Subtitle, SubtitleOne, SubtitleOneTranslate]),
  ],
  controllers: [SubtitleController],
  providers: [SubtitleService],
})
export class SubtitleModule {}
