import { League } from '../../../league/league.entity';

export const temStub = {
  id: 1,
  externalId: 1,
  name: 'Manchester United',
  location: 'Manchester, England',
  stadium: 'Old Trafford',
  league: {
    id: 1,
    externalId: 101,
    name: 'English Premier League',
    sport: 'Football',
    teams: [{ id: 1 }],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
};

export const upsertTemStub = {
  externalId: 1,
  name: 'Manchester United',
  location: 'Manchester, England',
  stadium: 'Old Trafford',
  league: {
    id: 1,
  } as unknown as League,
};
