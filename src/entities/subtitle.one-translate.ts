import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SubtitleOne } from './subtitle.one';

@Entity()
export class SubtitleOneTranslate {
  @PrimaryColumn()
  pk: string;

  @Column({ type: 'varchar' })
  languageCode: string;

  @Column({ type: 'varchar' })
  text: string;

  @Column({ type: 'varchar' })
  subtitleOnePk: string;

  @JoinColumn({ name: 'subtitleOnePk' })
  @ManyToOne(
    () => SubtitleOne,
    (subtitleOne) => subtitleOne.subtitleOneTranslates,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  subtitleOne: SubtitleOne;
}
