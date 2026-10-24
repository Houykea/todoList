import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ default: 'TODO' })
  status: string;

  // every to-do has an owner
  @ManyToOne(() => User, (u) => u.todos)
  owner: User;

  @Column()
  ownerId: string;
}
