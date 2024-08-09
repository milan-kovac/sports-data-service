import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { League } from 'src/league/league.entity';
import { LeagueService } from 'src/league/league.service';
import { TeamService } from 'src/team/team.service';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';
import { CacheService } from 'src/redis/cache.service';

@Injectable()
export class FetchUpsertDataService {
  constructor(
    private readonly httpService: HttpService,
    private readonly leagueService: LeagueService,
    private readonly teamService: TeamService,
    private readonly cacheService: CacheService,
  ) {}

  @LogMethod()
  async fetchUpsert(): Promise<void> {
    try {
      await this.fetchAndUpsertLeagues();
      await this.fetchAndUpsertTeams();
      await this.cacheIfNotExists();
    } catch (e) {
      Logger.error('Failed to fetch and upsert data:', e);
    }
  }

  @LogMethod()
  async cacheLeagues(): Promise<void> {
    const leagues = await this.leagueService.getLeagues(undefined, ['teams']);
    await this.cacheService.set('leagues', leagues, 300);
  }

  @LogMethod()
  private async fetchAndUpsertLeagues(): Promise<void> {
    const url = process.env.SPORTS_API + process.env.SPORTS_API_ALL_LEAGUES_PATH;
    const { data } = await firstValueFrom(this.httpService.get(url));

    const leagues = data?.leagues.map((league) => ({
      externalId: league.idLeague,
      name: league.strLeague,
      sport: league.strSport,
    }));

    await this.leagueService.upsert(leagues);
  }

  @LogMethod()
  private async fetchAndUpsertTeams(): Promise<void> {
    let legues = await this.leagueService.getLeagues(['id', 'externalId'], undefined);

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
  }

  @LogMethod()
  private async cacheIfNotExists(): Promise<void> {
    await this.cacheService.delete('leagues');
    const data = await this.cacheService.get('leagues');
    if (data) {
      return;
    }
    await this.cacheLeagues();
  }
}
