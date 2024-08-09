import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';

@Injectable()
export class KafkaProducerService {
  @Inject('KAFKA_PRODUCER')
  protected readonly clientKafka: ClientKafka;

  async onModuleInit() {
    await this.clientKafka.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.clientKafka.close();
  }

  @LogMethod()
  dispatchMessage(topic: string, message: any): void {
    try {
      this.clientKafka.emit(topic, message);
    } catch (e) {
      Logger.error(e);
    }
  }
}
