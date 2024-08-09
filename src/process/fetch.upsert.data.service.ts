import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { League } from 'src/league/league.entity';
import { LeagueService } from 'src/league/league.service';
import { TeamService } from 'src/team/team.service';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';

@Injectable()
export class FetchUpsertDataService {
  constructor(
    private readonly httpService: HttpService,
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
  ) {}

  @LogMethod()
  async fetchUpsert(): Promise<void> {
    try {
      await this.fetchAndUpsertLeagues();
      await this.fetchAndUpsertTeams();
    } catch (e) {
      Logger.error('Failed to fetch and upsert data:', e);
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
      Logger.error('Failed to fetch and upsert leagues data:', e);
    }
  }

  @LogMethod()
  private async fetchAndUpsertTeams(): Promise<void> {
    try {
      let legues = await this.leagueService.getLeagues(['id', 'externalId']);

      const mapTeamData = (team: any, leagueId: string): any => ({
        externalId: team.idTeam,
        name: team.strTeam,
        location: team.strLocation,
        stadium: team.strStadium,
        league: { id: leagueId } as unknown as League,
      });

      const fetchTeamsForLeague = async (league: any): Promise<any[]> => {
        const url = process.env.SPORTS_API + process.env.SPORTS_API_ALL_TEAMS + league.externalId;
        const { data } = await firstValueFrom(this.httpService.get(url));
        return data?.teams.map((team: any) => mapTeamData(team, league.id)) || [];
      };

      const leaguesTeams = await Promise.all(legues.map(fetchTeamsForLeague));
      const teams = leaguesTeams.flat();

      await this.teamService.upsert(teams);
    } catch (e) {
      Logger.error('Failed to fetch and upsert teams data:', e);
    }
  }
}
