import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { League } from 'src/league/league.entity';
import { LeagueService } from 'src/league/league.service';
import { TeamService } from 'src/team/team.service';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';
import { CacheService } from 'src/redis/cache.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { mapLeagues, mapTeam } from './helpers/helpers';

@Injectable()
export class ProcessService {
  private isProcessToggled = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
    private readonly cacheService: CacheService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  @LogMethod()
  async toggleProcess(): Promise<void> {
    this.isProcessToggled = !this.isProcessToggled;
    try {
      if (this.isProcessToggled) {
        await this.processTasks();
        const fiveMinuteInterval = setInterval(async () => {
          this.isProcessToggled ? await this.processTasks() : clearInterval(fiveMinuteInterval);
        }, 300000);
      }
    } catch (e) {
      Logger.error('An error occurred while toggling the process.', e);
    }
  }

  @LogMethod()
  private async processTasks(): Promise<void> {
    try {
      await this.updateLeaguesData();
      await this.updateTeamsData();
      await this.updateLeaguesCache();
      await this.sendLeaguesToKafka();
    } catch (e) {
      Logger.error('An error occurred while processing tasks.', e);
    }
  }

  @LogMethod()
  private async updateLeaguesData(): Promise<void> {
    const url = process.env.SPORTS_API + process.env.SPORTS_API_ALL_LEAGUES_PATH;
    const { data } = await firstValueFrom(this.httpService.get(url));
    const leagues = data?.leagues ? mapLeagues(data) : [];
    await this.leagueService.upsert(leagues);
  }

  @LogMethod()
  private async updateTeamsData(): Promise<void> {
    const legues = await this.leagueService.getLeagues(['id', 'externalId'], undefined);

    const fetchTeamsForLeague = async (league: any) => {
      const url = process.env.SPORTS_API + process.env.SPORTS_API_ALL_TEAMS + league.externalId;

      const { data } = await firstValueFrom(this.httpService.get(url));
      return data?.teams.map((team: any) => mapTeam(team, league.id)) || [];
    };

    const leaguesTeams = await Promise.all(legues.map(fetchTeamsForLeague));
    const teams = leaguesTeams.flat();

    await this.teamService.upsert(teams);
  }

  @LogMethod()
  private async updateLeaguesCache(): Promise<void> {
    const leagues = await this.leagueService.getLeagues(undefined, ['teams']);
    await this.cacheService.set('leagues', leagues, 300);
  }

  @LogMethod()
  private async sendLeaguesToKafka(): Promise<void> {
    const leagues = await this.getLeagues();

    for (const league of leagues) {
      if (!this.isProcessToggled) {
        return;
      }

      await this.kafkaProducerService.publish('data-sending', league);
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  @LogMethod()
  private async getLeagues(): Promise<League[]> {
    const cachedLeagues = await this.cacheService.get('leagues');
    return cachedLeagues ?? (await this.leagueService.getLeagues(undefined, ['teams']));
  }
}
