import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';
import { LeagueDataDto } from 'src/process/helpers/helpers';
import { CacheService } from 'src/redis/cache.service';

@Injectable()
export class LeagueService {
  constructor(
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    private readonly cacheService: CacheService,
  ) {}

  async onModuleInit() {
    await this.cacheService.delete('leagues');
  }

  @LogMethod()
  async upsert(leagues: LeagueDataDto[]): Promise<void> {
    try {
      await this.leagueRepository.upsert(leagues, ['externalId']);
    } catch (e) {
      Logger.error('An error occurred while upserting leagues.', e);
      throw e;
    }
  }

  @LogMethod()
  async getLeagues(): Promise<League[]> {
    try {
      const cachedLeagues = await this.cacheService.get('leagues');
      if (cachedLeagues) return cachedLeagues;

      return await this.leagueRepository.find({ relations: ['teams'] });
    } catch (e) {
      Logger.error('An error occurred while getting leagues.', e);
      throw e;
    }
  }

  @LogMethod()
  async updateCache(): Promise<void> {
    try {
      const leagues = await this.getLeagues();
      await this.cacheService.set('leagues', leagues, 300);
    } catch (e) {
      Logger.error('An error occurred while updating cache.', e);
      throw e;
    }
  }
}
