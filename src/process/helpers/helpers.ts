import { League } from 'src/league/league.entity';

interface LeagueData {
  idLeague: string;
  strLeague: string;
  strSport: string;
}

export interface LeagueDto {
  externalId: number;
  name: string;
  sport: string;
}

export interface TeamDto {
  externalId: number;
  name: string;
  location: string;
  stadium: string;
  league: League;
}

export function mapLeagues(data: { leagues: LeagueData[] }): LeagueDto[] {
  return data.leagues.map((league) => ({
    externalId: league.idLeague ? Number(league.idLeague) : 0,
    name: league.strLeague ?? '',
    sport: league.strSport ?? '',
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
