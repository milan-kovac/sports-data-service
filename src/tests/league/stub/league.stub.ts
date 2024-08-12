import { League } from 'src/league/league.entity';

export const leagueStub = {
  id: 1,
  externalId: 101,
  name: 'English Premier League',
  sport: 'Football',
  teams: [],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
} as League;

export const upsertLeagueStub = {
  externalId: 101,
  name: 'English Premier League',
  sport: 'Football',
  teams: [],
};
