import { League } from 'src/league/league.entity';

interface LeagueApiData {
  idLeague: string;
  strLeague: string;
  strSport: string;
}

export interface LeagueDataDto {
  externalId: number;
  name: string;
  sport: string;
  teams: TeamDto[];
}

export interface TeamDto {
  externalId: number;
  name: string;
  location: string;
  stadium: string;
  league: League;
}

export function mapLeagues(data: { leagues: LeagueApiData[] }): LeagueDataDto[] {
  return data.leagues.map((league) => ({
    externalId: league.idLeague ? Number(league.idLeague) : 0,
    name: league.strLeague ?? '',
    sport: league.strSport ?? '',
    teams: [],
  }));
}

export function mapTeam(team: any, leagueId: number): TeamDto {
  return {
    externalId: team.idTeam ? Number(team.idTeam) : 0,
    name: team.strTeam,
    location: team.strLocation,
    stadium: team.strStadium,
    league: { id: leagueId } as unknown as League,
  };
}
