import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProcessController } from './process.controller';
import { LeagueModule } from 'src/league/league.module';
import { TeamModule } from 'src/team/team.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { ProcessService } from './process.service';
import { RedisModule } from 'src/redis/redis.module';
import { CacheService } from 'src/redis/cache.service';
@Module({
  imports: [HttpModule, LeagueModule, TeamModule, KafkaModule, RedisModule],
  providers: [ProcessService, CacheService],
  controllers: [ProcessController],
})
export class ProcessModule {}
