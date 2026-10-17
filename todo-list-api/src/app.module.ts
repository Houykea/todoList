import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TodosModule } from './todos/todos.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'todo',
      autoLoadEntities: true,
      synchronize: false,
    }),
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'todo-list',
    }),
    TodosModule,
    ProfileModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
