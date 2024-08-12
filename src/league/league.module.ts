import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueService } from './league.service';
import { League } from './league.entity';
import { CacheService } from '../redis/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([League])],
  providers: [LeagueService, CacheService],
  exports: [LeagueService],
})
export class LeagueModule {}
