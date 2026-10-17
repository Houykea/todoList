import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodosService } from './todos.service.js';
import { Todo } from './entities/todo.entity.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';

describe('TodosService', () => {
  let service: TodosService;
  let repo: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    // In-memory fake of the TypeORM repository so the service can be unit
    // tested without a real Postgres connection.
    repo = {
      create: vi.fn((dto) => dto),
      save: vi.fn((todo) => Promise.resolve({ id: 1, status: 'TODO', ...todo })),
      find: vi.fn(() => Promise.resolve([])),
      findOneBy: vi.fn(() => Promise.resolve(null)),
      remove: vi.fn(() => Promise.resolve(undefined)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: repo as unknown as Repository<Todo>,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a todo via the repository', async () => {
    const dto: CreateTodoDto = { title: 'Buy milk' };
    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, status: 'TODO', title: 'Buy milk' });
  });

  it('throws NotFoundException when a todo does not exist', async () => {
    repo.findOneBy.mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toThrow('Todo #999 not found');
  });
});
