  import { Entity, PrimaryGeneratedColumn, Column } from
'typeorm';
  
  @Entity()
  export class Todo {
    @PrimaryGeneratedColumn()
    id: number;              // auto-incrementing unique ID (PRIMARY KEY)
  
    @Column({ length: 200 })
    title: string;           // text column, max 200 characters
  
    @Column({ default: 'TODO' })
    status: string;          // auto-fills "TODO" if none given (DEFAULT constraint)
  }