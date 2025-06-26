import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity()
export class Url extends BaseEntity {
  @Column({ unique: true, length: 6 })
  shortCode: string;

  @Column()
  targetUrl: string;

  @Column({ default: 0 })
  clicks: number;

  @ManyToOne(() => User, (user) => user.urls, { nullable: true, onDelete: 'SET NULL' })
  user?: User;
}
