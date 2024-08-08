import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TasksService } from './task.service';

import { LeagueModule } from 'src/league/league.module';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports: [HttpModule, LeagueModule, TeamModule],
  providers: [TasksService],
})
export class TaskModule {}
