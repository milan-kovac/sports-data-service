export const MockCacheService = jest.fn().mockReturnValue({
  set: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
});
