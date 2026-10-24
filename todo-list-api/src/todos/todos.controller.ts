import {
  Controller,
  Get,
  Post,
  HttpCode,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthUser } from '../auth/auth-user.interface.js';
import { Role } from '../users/entities/user.entity.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @CurrentUser() user: AuthUser) {
    // Ownership is taken from the token, not the client body.
    return this.todosService.create(createTodoDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.todosService.findAllFor(user);
  }

  // Admin-only route (RBAC) — demonstrates @Roles + RolesGuard.
  @Roles(Role.ADMIN)
  @Get('all')
  findAllAdmin() {
    return this.todosService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.todosService.findOneFor(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.todosService.updateFor(id, updateTodoDto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.todosService.removeFor(id, user);
  }
}
