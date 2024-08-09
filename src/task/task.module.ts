import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TasksService } from './task.service';

import { LeagueModule } from 'src/league/league.module';
import { TeamModule } from 'src/team/team.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [HttpModule, LeagueModule, TeamModule, KafkaModule],
  providers: [TasksService],
})
export class TaskModule {}
