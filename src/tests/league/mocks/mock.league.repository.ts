export const MockLeagueRepository = jest.fn().mockReturnValue({
  upsert: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
});
