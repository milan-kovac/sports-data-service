import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { LogMethod } from '../shared/decorators/log.method.decorator';
import { TeamDto } from '../process/helpers/helpers';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  @LogMethod()
  async upsert(teams: TeamDto[]): Promise<void> {
    try {
      await this.teamRepository.upsert(teams, ['externalId', 'league']);
    } catch (e) {
      Logger.error('An error occurred while upserting teams.', e);
      throw e;
    }
  }
}
