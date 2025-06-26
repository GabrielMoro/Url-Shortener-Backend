import { Entity, Column, OneToMany } from 'typeorm';
import { Url } from '../../url/entities/url.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Url, (url) => url.user)
  urls: Url[];
}
