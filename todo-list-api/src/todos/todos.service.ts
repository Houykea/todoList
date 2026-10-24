import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import type { AuthUser } from '../auth/auth-user.interface.js';
import { Role } from '../users/entities/user.entity.js';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) {}

  // Owner comes from the TOKEN (user.id), never from the request body.
  create(dto: CreateTodoDto, user: AuthUser) {
    return this.repo.save(this.repo.create({ ...dto, ownerId: user.id }));
  }

  // Filter in the query — never load everything and filter in JS.
  findAllFor(user: AuthUser) {
    return this.repo.find({
      where: { ownerId: user.id },
      order: { id: 'ASC' },
    });
  }

  // Resource-level check. Return 404 (not 403) for other people's data so we
  // leak nothing about whether the row exists. Admins may read any row.
  async findOneFor(id: number, user: AuthUser) {
    const todo = await this.repo.findOneBy({ id });
    const allowed =
      todo && (todo.ownerId === user.id || user.role === Role.ADMIN);
    if (!allowed) throw new NotFoundException(`Todo #${id} not found`);
    return todo;
  }

  async updateFor(id: number, dto: UpdateTodoDto, user: AuthUser) {
    const todo = await this.findOneFor(id, user);
    Object.assign(todo, dto);
    return this.repo.save(todo);
  }

  async removeFor(id: number, user: AuthUser) {
    const todo = await this.findOneFor(id, user);
    await this.repo.remove(todo);
  }

  // Admin-only: see everything.
  findAllAdmin() {
    return this.repo.find({ order: { id: 'ASC' } });
  }
}
