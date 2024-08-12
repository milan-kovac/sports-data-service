import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProcessController } from './process.controller';
import { LeagueModule } from '../league/league.module';
import { TeamModule } from '../team/team.module';
import { KafkaModule } from '../kafka/kafka.module';
import { ProcessService } from './process.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'process',
      connection: {
        port: Number(process.env.REDIS_PORT),
      },
    }),
    LeagueModule,
    TeamModule,
    KafkaModule,
    RedisModule,
  ],
  providers: [ProcessService],
  controllers: [ProcessController],
})
export class ProcessModule {}
