import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class UserTag {
  @PrimaryColumn({ type: 'varchar' })
  pk: string;

  @Column({ type: 'varchar' })
  tag: string;

  @Column({ type: 'varchar' })
  userPk: string;

  @JoinColumn({ name: 'userPk' })
  @ManyToOne(() => User, (user) => user.tags, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
}
