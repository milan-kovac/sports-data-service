import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { League } from 'src/league/league.entity';
import { LeagueService } from 'src/league/league.service';
import { CacheService } from 'src/redis/cache.service';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';

@Injectable()
export class TransmitDataService {
  private intervalId: NodeJS.Timeout;

  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly leagueService: LeagueService,
    private readonly cacheService: CacheService,
  ) {}

  @LogMethod()
  async startTransmission(): Promise<void> {
    try {
      const leagues = await this.getLeagues();
      let currentIndex = 0;

      this.intervalId = setInterval(async () => {
        if (currentIndex >= leagues.length) {
          clearInterval(this.intervalId);
          Logger.verbose('Transmission completed.');
          return;
        }

        this.kafkaProducerService.dispatchMessage('data-sending', leagues[currentIndex]);

        currentIndex++;
      }, 1);
    } catch (e) {
      Logger.error('An error occurred while starting transmission:', e);
    }
  }

  @LogMethod()
  private async getLeagues(): Promise<League[]> {
    const data = await this.cacheService.get('leagues');
    if (data) {
      return data as League[];
    }

    return await this.leagueService.getLeagues([], ['teams']);
  }
}
