import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';

@Injectable()
export class TransmitDataService {
  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  @LogMethod()
  async transmitData(): Promise<void> {
    try {
      console.log('running a task every 10 second');
      await this.kafkaProducerService.dispatchMessage('data-sending', 'milan je car');
    } catch (e) {
      Logger.error('An error occurred while syncing data:', e);
    }
  }
}
