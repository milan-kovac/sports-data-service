export const MockTeamRepository = jest.fn().mockReturnValue({
  upsert: jest.fn().mockReturnThis(),
});
