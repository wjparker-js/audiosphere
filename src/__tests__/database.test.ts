import { testConnection } from '@/lib/database';

describe('Database Connection', () => {
  test('should connect to audiosphere database', async () => {
    const connected = await testConnection();
    expect(connected).toBe(true);
  }, 10000); // 10 second timeout for database connection
});