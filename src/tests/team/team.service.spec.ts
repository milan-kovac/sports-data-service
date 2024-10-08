import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Team } from '../../team/team.entity';
import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { MockTeamRepository } from './mocks/mock.team.repository';
import { TeamService } from '../../team/team.service';
import { upsertTemStub } from './stub/team.stub';
describe('TeamService', () => {
  let teamRepository: Repository<Team>;
  let service: TeamService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        TeamService,
        {
          provide: getRepositoryToken(Team),
          useClass: MockTeamRepository,
        },
      ],
    }).compile();
    teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    service = module.get<TeamService>(TeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should inject teamRepository via constructor', () => {
    expect(service['teamRepository']).toBeDefined();
    expect(service['teamRepository']).toBe(teamRepository);
  });

  describe('upsert', () => {
    const upsertData = [upsertTemStub];
    it('should be called with the appropriate parameters', async () => {
      const serviceSpy = jest.spyOn(service, 'upsert');
      const repositorySpy = jest.spyOn(teamRepository, 'upsert').mockResolvedValue(undefined);
      await service.upsert(upsertData);
      expect(serviceSpy).toHaveBeenCalledWith(upsertData);
      expect(repositorySpy).toHaveBeenCalledWith(upsertData, ['externalId', 'league']);
    });
    it('should log an error when upsert fails', async () => {
      const loggerErrorSpy = jest.spyOn(Logger, 'error');
      const mockError = new Error('Upsert failed');
      jest.spyOn(teamRepository, 'upsert').mockRejectedValue(mockError);
      try {
        await service.upsert(upsertData);
        await expect(service.upsert(upsertData)).rejects.toThrow('Upsert failed');
      } catch (e) {
        expect(loggerErrorSpy).toHaveBeenCalledWith('An error occurred while upserting teams.', mockError);
      }
    });
  });
});
