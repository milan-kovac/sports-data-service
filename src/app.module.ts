import { Module } from '@nestjs/common';
import { ProcessModule } from './process/process.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/date.source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot(dataSourceOptions),
    ProcessModule,
  ],
})
export class AppModule {}
