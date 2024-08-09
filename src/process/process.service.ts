import { Injectable, Logger } from '@nestjs/common';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FetchUpsertDataService } from './fetch.upsert.data.service';
import { TransmitDataService } from './transmit.data.service';

@Injectable()
export class ProcessService {
  private isRunning = false;

  constructor(
    private readonly fetchUpsertDataService: FetchUpsertDataService,
    private readonly transmitDataService: TransmitDataService,
  ) {}

  @LogMethod()
  async toggle(): Promise<void> {
    this.isRunning = !this.isRunning;

    try {
      await this.fetchUpsertDataService.fetchUpsert();
      await this.transmitDataService.transmitData();
    } catch (e) {
      Logger.error('An error occurred while toggling functionality:', e);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  @LogMethod()
  async syncData(): Promise<void> {
    try {
      if (this.isRunning) {
        await this.fetchUpsertDataService.fetchUpsert();
      }
    } catch (e) {
      Logger.error('An error occurred while syncing data:', e);
    }
  }
}
