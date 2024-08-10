import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';
import { TeamDto } from 'src/process/helpers/helpers';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  @LogMethod()
  async upsert(teams: TeamDto[]): Promise<void> {
    await this.teamRepository.upsert(teams, ['externalId', 'league']);
  }
}
