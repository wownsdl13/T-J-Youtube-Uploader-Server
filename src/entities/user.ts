import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { UserTag } from './user.tag';
@Entity()
export class User {
  @PrimaryColumn({
    type: 'varchar',
    // charset: 'utf8mb4',
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  youtubeApiKey: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  openAiApiKey: string;

  @Column({
    type: 'longtext',
  })
  titleHeader: string;

  @Column({
    type: 'longtext',
  })
  descriptionHeader: string;

  @OneToMany(() => UserTag, (people) => people.user, {
    nullable: false,
    eager: true,
    cascade: ['insert', 'update', 'remove'],
  })
  tags: UserTag[];
}
