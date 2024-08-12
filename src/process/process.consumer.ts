import { Logger } from '@nestjs/common';
import { RateLimitedAxiosInstance } from 'axios-rate-limit';
import { OnQueueCleaned, Process, Processor } from '@nestjs/bull';
import { League } from '../league/league.entity';
import { LeagueService } from '../league/league.service';
import { KafkaProducerService } from '../kafka/kafka.producer.service';
import { LogMethod } from '../shared/decorators/log.method.decorator';
import { mapLeagues, mapTeam, TeamDto } from './helpers/helpers';
import { TeamService } from '../team/team.service';
import { rateLimitedAxios } from '../shared/axios/rate.limit.config';
import { JOB_LEAGUES_BATCH_ID, JOB_LEAGUES_ID, JOB_TEAMS_ID } from '../shared/constants/queue.jobs.constants';
@Processor('process')
export class ProcessConsumer {
  private isToggled = true;
  private http: RateLimitedAxiosInstance;

  constructor(
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {
    this.http = rateLimitedAxios();
  }

  @Process(JOB_LEAGUES_ID)
  private async fetchAndUpdateLeagues(): Promise<void> {
    try {
      const url = process.env.SPORTS_API_ALL_LEAGUES_PATH;
      const { data } = await this.http.get(url);
      const leagues = data?.leagues ? mapLeagues(data) : [];
      await this.leagueService.upsert(leagues);
    } catch (e) {
      Logger.error('Failed to fetch and upsert leagues.', e);
    }
  }

  @Process(JOB_TEAMS_ID)
  private async fetchAndUpsertTeams(): Promise<void> {
    try {
      const leagues = await this.leagueService.getLeagues();
      const mapedTemas = await Promise.all(leagues.map((league) => this.mapLeagueTeams(league)));
      const teams = mapedTemas.flat();
      await this.teamService.upsert(teams);
    } catch (e) {
      Logger.error('Failed to fetch and upsert teams.', e);
    }
  }

  @Process(JOB_LEAGUES_BATCH_ID)
  private async sendLeaguesBatch(): Promise<void> {
    try {
      const leagues = await this.leagueService.getLeagues();

      for (const league of leagues) {
        if (!this.isToggled) return;
        await this.kafkaProducerService.send('data-sending', league);
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    } catch (e) {
      Logger.error('Failed to send leagues batch.', e);
    }
  }

  @LogMethod()
  private async mapLeagueTeams(league: League): Promise<TeamDto> {
    try {
      const url = process.env.SPORTS_API_ALL_TEAMS_PATH + league.externalId;
      const { data } = await this.http.get(url);
      return data?.teams.map((team: any) => mapTeam(team, league.id)) || [];
    } catch (e) {
      Logger.error('Failed to map teams for a league.', e);
    }
  }

  @OnQueueCleaned()
  toogleJob() {
    this.isToggled = !this.isToggled;
  }
}
