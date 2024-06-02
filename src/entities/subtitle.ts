import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { SubtitleOne } from './subtitle.one';

@Entity()
export class Subtitle {
  @PrimaryColumn({ type: 'varchar' })
  pk: string;

  @Column({
    type: 'bigint',
  })
  createTime: number;

  @OneToMany(() => SubtitleOne, (subtitleOne) => subtitleOne.subtitle, {
    nullable: false,
    eager: true,
    cascade: ['insert', 'update', 'remove'],
  })
  subtitles: SubtitleOne[];
}
