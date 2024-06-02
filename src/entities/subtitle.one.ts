import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Subtitle } from './subtitle';
import { SubtitleOneTranslate } from './subtitle.one-translate';
import { SubtitleOneType } from '../enum/subtitle.one-type';

@Entity()
export class SubtitleOne {
  @PrimaryColumn({
    type: 'varchar',
  })
  pk: string;

  @Column({
    type: 'int',
  })
  order: number;

  @Column({
    type: 'varchar',
  })
  period: string;

  @Column({
    type: 'enum',
    enum: SubtitleOneType,
  })
  subtitleOneType: SubtitleOneType;

  @Column({ type: 'varchar' })
  subtitlePk: string;

  @JoinColumn({ name: 'subtitlePk' })
  @ManyToOne(() => Subtitle, (subtitle) => subtitle.subtitles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  subtitle: Subtitle;

  @OneToMany(
    () => SubtitleOneTranslate,
    (subtitleOneTranslate) => subtitleOneTranslate.subtitleOne,
    {
      nullable: false,
      eager: true,
      cascade: ['insert', 'update', 'remove'],
    },
  )
  subtitleOneTranslates: SubtitleOneTranslate[];
}
