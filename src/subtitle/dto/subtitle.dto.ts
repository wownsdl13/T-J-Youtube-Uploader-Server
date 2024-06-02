import { SubtitleOneDto } from './subtitle-one.dto';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SubtitleDto {
  @IsString()
  pk: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtitleOneDto)
  subtitles: SubtitleOneDto[];
}
