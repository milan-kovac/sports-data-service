import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { League } from 'src/league/league.entity';
import { LeagueService } from 'src/league/league.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';
import { mapLeagues, mapTeam, TeamDto } from './helpers/helpers';
import { TeamService } from 'src/team/team.service';

@Injectable()
export class ProcessService {
  private isProcessToggled = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  @LogMethod()
  toggleProcess(): void {
    this.isProcessToggled = !this.isProcessToggled;

    if (this.isProcessToggled) {
      this.processTasks()
        .then(() => this.scheduleTasks())
        .catch((e) => Logger.error('An error occurred while processing tasks.', e));
    }
  }

  @LogMethod()
  private async processTasks(): Promise<void> {
    try {
      await this.fetchAndUpdateLeagues();
      await this.fetchAndUpdateTeams();
      await this.leagueService.updateCache();
      this.sendLeaguesBatch();
    } catch (e) {
      Logger.error('An error occurred while processing tasks.', e);
    }
  }

  @LogMethod()
  private async fetchAndUpdateLeagues(): Promise<void> {
    const url = process.env.SPORTS_API_ALL_LEAGUES_PATH;
    const { data } = await firstValueFrom(this.httpService.get(url));
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
    const url = process.env.SPORTS_API_ALL_TEAMS + league.externalId;
    const { data } = await firstValueFrom(this.httpService.get(url));
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
