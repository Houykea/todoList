import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller.js';
import { TodosService } from './todos.service.js';

describe('TodosController', () => {
  let controller: TodosController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    // Mock the service so the controller is tested in isolation (no DB).
    service = {
      create: vi.fn((dto) => ({ id: 1, status: 'TODO', ...dto })),
      findAll: vi.fn(() => []),
      findOne: vi.fn((id) => ({ id, title: 'x', status: 'TODO' })),
      update: vi.fn((id, dto) => ({ id, status: 'TODO', ...dto })),
      remove: vi.fn(() => undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [{ provide: TodosService, useValue: service }],
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to the service', () => {
    controller.create({ title: 'Write report' });
    expect(service.create).toHaveBeenCalledWith({ title: 'Write report' });
  });

  it('delegates findAll to the service', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });
});
