import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'REDIS_CACHE_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.get<string>('REDIS_URL'));
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CACHE_CLIENT'],
})
export class RedisModule {}
