import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueService } from './league.service';
import { League } from './league.entity';

@Module({
  imports: [TypeOrmModule.forFeature([League])],
  providers: [LeagueService],
  exports: [LeagueService],
})
export class LeagueModule {}
