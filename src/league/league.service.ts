import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';

@Injectable()
export class LeagueService {
  constructor(
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
  ) {}

  @LogMethod()
  async upsert(leagues: League[]): Promise<void> {
    await this.leagueRepository.upsert(leagues, ['externalId']);
  }

  @LogMethod()
  async getLeagues(select?: (keyof League)[], relations?: string[]): Promise<League[]> {
    return await this.leagueRepository.find({
      select,
      relations,
    });
  }
}
