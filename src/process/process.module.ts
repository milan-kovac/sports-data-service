import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProcessController } from './process.controller';
import { LeagueModule } from 'src/league/league.module';
import { TeamModule } from 'src/team/team.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { ProcessService } from './process.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'process',
      connection: {
        port: 6379,
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
