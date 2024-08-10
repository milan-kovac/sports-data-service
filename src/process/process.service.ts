import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';
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
    @Inject('REDIS_SUBSCRIBER_CLIENT') private readonly redis: Redis,
    private readonly httpService: HttpService,
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
    private readonly cacheService: CacheService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  onModuleInit(): void {
    this.redis.subscribe('toggle-events', (err, count) => {
      if (err) {
        Logger.error('Failed to subscribe:', err);
      } else {
        Logger.log(`Subscribed to ${count} channels.`);
      }
    });

    this.redis.on('message', async (channel, message) => {
      if (channel === 'toggle-events') {
        this.isProcessToggled = !this.isProcessToggled;
        await this.handleProcessStateToggle();
      }
    });
  }

  @LogMethod()
  private async handleProcessStateToggle(): Promise<void> {
    try {
      if (this.isProcessToggled) {
        await this.performScheduledOperations();
        const fiveMinuteInterval = setInterval(async () => {
          this.isProcessToggled ? await this.performScheduledOperations() : clearInterval(fiveMinuteInterval);
        }, 300000);
      }
    } catch (e) {
      Logger.error('An error occurred while toggling the process state.', e);
    }
  }

  @LogMethod()
  private async performScheduledOperations(): Promise<void> {
    try {
      await this.updateLeaguesData();
      await this.updateTeamsData();
      await this.ensureLeaguesCach();
      await this.startTransmission();
    } catch (e) {
      Logger.error('An error occurred during scheduled operations.', e);
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
    let legues = await this.leagueService.getLeagues(['id', 'externalId'], undefined);

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
  private async ensureLeaguesCach(): Promise<void> {
    const data = await this.cacheService.get('leagues');
    if (data) {
      return;
    }
    const leagues = await this.leagueService.getLeagues(undefined, ['teams']);
    await this.cacheService.set('leagues', leagues, 300);
  }

  @LogMethod()
  async startTransmission(): Promise<void> {
    const leagues = await this.getLeagues();
    let currentIndex = 0;

    const tenSecondInterval = setInterval(async () => {
      if (currentIndex >= leagues.length || !this.isProcessToggled) {
        clearInterval(tenSecondInterval);
        return;
      }
      this.kafkaProducerService.emitMessage('data-sending', leagues[currentIndex]);

      currentIndex++;
    }, 10000);
  }

  @LogMethod()
  private async getLeagues(): Promise<League[]> {
    const data = await this.cacheService.get('leagues');
    if (data) {
      return data as League[];
    }

    return await this.leagueService.getLeagues(undefined, ['teams']);
  }
}
