import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';
import { League } from 'src/league/league.entity';
import { LeagueService } from '../league/league.service';
import { TeamService } from 'src/team/team.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly httpService: HttpService,
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
  ) {}

  @Cron('*/5 * * * *')
  @LogMethod()
  async syncData(): Promise<void> {
    try {
      await this.fetchAndUpsertLeagues();
      await this.fetchAndUpsertTeams();
    } catch (e) {
      Logger.error('An error occurred while syncing data:', e);
    }
  }

  @LogMethod()
  private async fetchAndUpsertLeagues(): Promise<void> {
    try {
      const url = process.env.SPORTS_API + process.env.SPORTS_API_ALL_LEAGUES_PATH;
      const { data } = await firstValueFrom(this.httpService.get(url));

      const leagues = data?.leagues.map((league) => ({
        externalId: league.idLeague,
        name: league.strLeague,
        sport: league.strSport,
      }));

      await this.leagueService.upsert(leagues);
    } catch (e) {
      Logger.error(e);
    }
  }

  @LogMethod()
  private async fetchAndUpsertTeams(): Promise<void> {
    try {
      let legues = await this.leagueService.getLeagues(['id', 'externalId']);

      const teams = await Promise.all(
        legues.map(async (legue) => {
          const url = process.env.SPORTS_API + process.env.SPORTS_API_ALL_TEAMS + legue.externalId;
          const { data } = await firstValueFrom(this.httpService.get(url));

          return data?.teams.map((team: any) => ({
            externalId: team.idTeam,
            name: team.strTeam,
            location: team.strLocation,
            stadium: team.strStadium,
            league: { id: legue.id } as League,
          }));
        }),
      );

      await this.teamService.upsert(teams.flat());
    } catch (e) {
      Logger.error(e);
    }
  }
}
