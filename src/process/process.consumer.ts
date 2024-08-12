import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OnQueueCleaned, Process, Processor } from '@nestjs/bull';
import { League } from '../league/league.entity';
import { LeagueService } from '../league/league.service';
import { KafkaProducerService } from '../kafka/kafka.producer.service';
import { LogMethod } from '../shared/decorators/log.method.decorator';
import { mapLeagues, mapTeam, TeamDto } from './helpers/helpers';
import { TeamService } from '../team/team.service';
import { JOB_LEAGUES_PERIODIC_ID, JOB_LEAGUES_ID, JOB_TEAMS_ID } from '../shared/constants/queue.jobs.constants';
import { firstValueFrom } from 'rxjs';

@Processor('process')
export class ProcessConsumer {
  private isToggled = true;

  constructor(
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly http: HttpService,
  ) {}

  @Process(JOB_LEAGUES_ID)
  private async fetchAndUpdateLeagues(): Promise<void> {
    try {
      if (!this.isToggled) return;
      const url = process.env.SPORTS_API_ALL_LEAGUES_PATH;
      const { data } = await firstValueFrom(this.http.get(url));
      const leagues = data?.leagues ? mapLeagues(data) : [];
      await this.leagueService.upsert(leagues);
    } catch (e) {
      Logger.error('Failed to fetch and upsert leagues.', e);
    }
  }

  @Process(JOB_TEAMS_ID)
  private async fetchAndUpsertTeams(): Promise<void> {
    try {
      if (!this.isToggled) return;
      const leagues = await this.leagueService.getLeagues();
      const mappedTeams = await Promise.all(leagues.map((league) => this.mapLeagueTeams(league)));
      const teams = mappedTeams.flat();
      await this.teamService.upsert(teams);
      await this.leagueService.updateCache();
    } catch (e) {
      Logger.error('Failed to fetch and upsert teams.', e);
    }
  }

  @Process(JOB_LEAGUES_PERIODIC_ID)
  private async periodicLeaguesDispatch(): Promise<void> {
    try {
      const leagues = await this.leagueService.getLeagues();

      let index = 0;

      const sendMessage = async () => {
        if (index < leagues.length && this.isToggled) {
          await this.kafkaProducerService.send('data-sending', leagues[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      };

      const interval = setInterval(sendMessage, 10000);
    } catch (e) {
      Logger.error('Failed to send leagues batch.', e);
    }
  }

  @LogMethod()
  private async mapLeagueTeams(league: League): Promise<TeamDto> {
    try {
      if (!this.isToggled) return;
      const url = process.env.SPORTS_API_ALL_TEAMS_PATH + league.externalId;
      const { data } = await firstValueFrom(this.http.get(url));
      return data?.teams.map((team: any) => mapTeam(team, league.id)) || [];
    } catch (e) {
      Logger.error('Failed to map teams for a league.', e);
    }
  }

  @OnQueueCleaned()
  toggleJob() {
    this.isToggled = !this.isToggled;
  }
}
