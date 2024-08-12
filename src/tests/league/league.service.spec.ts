import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { LeagueService } from '../../league/league.service';
import { League } from '../../league/league.entity';
import { MockLeagueRepository } from './mocks/mock.league.repository';
import { leagueStub, upsertLeagueStub } from './stub/league.stub';
import { CacheService } from '../../redis/cache.service';
import { MockCacheService } from '../redis/mocks/mock.cache.service';
import { forwardRef, Logger } from '@nestjs/common';

describe('LeagueService', () => {
  let leagueRepository: Repository<League>;
  let cacheService: CacheService;
  let service: LeagueService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        LeagueService,
        {
          provide: CacheService,
          useFactory: () => new MockCacheService(),
        },
        {
          provide: getRepositoryToken(League),
          useFactory: () => new MockLeagueRepository(),
        },
      ],
    }).compile();
    leagueRepository = module.get<Repository<League>>(getRepositoryToken(League));
    service = module.get<LeagueService>(LeagueService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('upsert', () => {
    const upsertData = [upsertLeagueStub];
    it('should be called with the appropriate parameters', async () => {
      const serviceSpy = jest.spyOn(service, 'upsert');
      const repositorySpy = jest.spyOn(leagueRepository, 'upsert').mockResolvedValue(undefined);
      await service.upsert(upsertData);
      expect(serviceSpy).toHaveBeenCalledWith(upsertData);
      expect(repositorySpy).toHaveBeenCalledWith(upsertData, ['externalId']);
    });
    it('should log an error when upsert fails', async () => {
      const loggerErrorSpy = jest.spyOn(Logger, 'error');
      const mockError = new Error('Upsert failed');
      jest.spyOn(leagueRepository, 'upsert').mockRejectedValue(mockError);
      try {
        await service.upsert(upsertData);
        await expect(service.upsert(upsertData)).rejects.toThrow('Upsert failed');
      } catch (e) {
        expect(loggerErrorSpy).toHaveBeenCalledWith('An error occurred while upserting leagues.', mockError);
      }
    });
  });

  describe('getLeagues', () => {
    it('should return leagues from cache', async () => {
      const cachedLeagues = [upsertLeagueStub];
      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedLeagues);

      const result = await service.getLeagues();
      expect(result).toEqual(cachedLeagues);
      expect(cacheService.get).toHaveBeenCalledWith('leagues');
    });

    it('should return leagues from database when not in cache', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(leagueRepository, 'find').mockResolvedValue([leagueStub]);

      const result = await service.getLeagues();
      expect(result).toEqual([leagueStub]);
      expect(cacheService.get).toHaveBeenCalledWith('leagues');
      expect(leagueRepository.find).toHaveBeenCalledWith({ relations: ['teams'], order: { id: 'ASC' } });
    });
  });
});
