import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { LeagueModule } from 'src/league/league.module';
import { TeamModule } from 'src/team/team.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { FetchUpsertDataService } from './fetch.upsert.data.service';
import { TransmitDataService } from './transmit.data.service';
import { RedisModule } from 'src/redis/redis.module';
import { CacheService } from 'src/redis/cache.service';
@Module({
  imports: [HttpModule, LeagueModule, TeamModule, KafkaModule, RedisModule],
  providers: [ProcessService, FetchUpsertDataService, TransmitDataService, CacheService],
  controllers: [ProcessController],
})
export class ProcessModule {}
