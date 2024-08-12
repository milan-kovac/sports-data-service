import { Injectable, Logger } from '@nestjs/common';
import { RateLimitedAxiosInstance } from 'axios-rate-limit';
import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { League } from '../league/league.entity';
import { LeagueService } from '../league/league.service';
import { KafkaProducerService } from '../kafka/kafka.producer.service';
import { LogMethod } from '../shared/decorators/log.method.decorator';
import { mapLeagues, mapTeam, TeamDto } from './helpers/helpers';
import { TeamService } from '../team/team.service';
import { rateLimitedAxios } from '../shared/axios/rate.limit.config';

@Injectable()
@Processor('process')
export class ProcessService extends WorkerHost {
  private isProcessToggled = false;
  private http: RateLimitedAxiosInstance;
  constructor(
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {
    super();
    this.http = rateLimitedAxios();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === 'toggleProcess') {
      this.isProcessToggled = !this.isProcessToggled;
      if (this.isProcessToggled) {
        try {
          this.processTasks();
          this.scheduleTasks();
        } catch (e) {
          Logger.error('An error occurred while processing tasks.', e);
        }
      }
    }
  }

  @LogMethod()
  private async processTasks(): Promise<void> {
    try {
      await this.fetchAndUpdateLeagues();
      await this.fetchAndUpdateTeams();
      await this.leagueService.updateCache();
      await this.sendLeaguesBatch();
    } catch (e) {
      Logger.error('An error occurred while processing tasks.', e);
    }
  }

  @LogMethod()
  private async fetchAndUpdateLeagues(): Promise<void> {
    const url = process.env.SPORTS_API_ALL_LEAGUES_PATH;
    const { data } = await this.http.get(url);
    const leagues = data?.leagues ? mapLeagues(data) : [];
    await this.leagueService.upsert(leagues);
  }

  @LogMethod()
  private async fetchAndUpdateTeams(): Promise<void> {
    const leagues = await this.leagueService.getLeagues();
    const mapedTemas = await Promise.all(leagues.map((league) => this.mapLeagueTeams(league)));
    const teams = mapedTemas.flat();
    await this.teamService.upsert(teams);
  }

  @LogMethod()
  private async mapLeagueTeams(league: League): Promise<TeamDto> {
    const url = process.env.SPORTS_API_ALL_TEAMS_PATH + league.externalId;
    const { data } = await this.http.get(url);
    return data?.teams.map((team: any) => mapTeam(team, league.id)) || [];
  }

  @LogMethod()
  private async sendLeaguesBatch(): Promise<void> {
    const leagues = await this.leagueService.getLeagues();

    for (const league of leagues) {
      if (!this.isProcessToggled) return;
      await this.kafkaProducerService.send('data-sending', league);
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  @LogMethod()
  private scheduleTasks(): void {
    const interval = setInterval(async () => {
      this.isProcessToggled ? this.processTasks() : clearInterval(interval);
    }, 300000);
  }
}
