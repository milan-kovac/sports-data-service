import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { LogMethod } from '../shared/decorators/log.method.decorator';

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CACHE_CLIENT') private readonly redis: Redis) {}

  @LogMethod()
  async set(key: string, value: any, ttl: number = 600): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (e) {
      Logger.error(`Error setting cache for key: ${key}`, e.stack);
    }
  }

  @LogMethod()
  async get(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      Logger.error(`Error getting cache for key: ${key}`, e.stack);
    }
  }

  @LogMethod()
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (e) {
      Logger.error(`Error deleting cache for key: ${key}`, e.stack);
    }
  }
}
