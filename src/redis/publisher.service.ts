import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class PublisherService {
  constructor(@Inject('REDIS_PUBLISHER_CLIENT') private readonly redis: Redis) {}

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.redis.publish(channel, message);
    } catch (e) {
      Logger.error('Error publishing message:', e.stack);
    }
  }
}
