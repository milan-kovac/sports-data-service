import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { ProcessController } from './process.controller';
import { LeagueModule } from '../league/league.module';
import { TeamModule } from '../team/team.module';
import { KafkaModule } from '../kafka/kafka.module';
import { ProcessConsumer } from './process.consumer';
import { RedisModule } from '../redis/redis.module';
import { ProcessService } from './process.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: 'localhost',
          port: Number(process.env.REDIS_PORT),
        },
      }),
    }),
    BullModule.registerQueueAsync({
      name: 'process',
    }),
    HttpModule.register({
      baseURL: process.env.SPORTS_API,
      timeout: 5000,
      maxRedirects: 5,
    }),
    LeagueModule,
    TeamModule,
    KafkaModule,
    RedisModule,
  ],
  providers: [ProcessService, ProcessConsumer],
  controllers: [ProcessController],
})
export class ProcessModule {}
