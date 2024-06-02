import { IsInt, IsObject, IsString } from 'class-validator';
import { SubtitleOneType } from '../../enum/subtitle.one-type';

export class SubtitleOneDto {
  @IsInt()
  order: number;

  @IsString()
  period: string;

  @IsString()
  subtitleOneType: SubtitleOneType;

  @IsObject()
  translations: { [key: string]: string };
}
