import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';

@Injectable()
export class KafkaProducerService {
  @Inject('SERVER')
  protected readonly clientKafka: ClientKafka;

  async onModuleInit() {
    console.log('Modile init');
    await this.clientKafka.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.clientKafka.close();
  }

  @LogMethod()
  async publishMessageToTopic(topic: string, message: any) {
    console.log(process.env.KAFKA_BROKER);
    try {
      const result = await this.clientKafka.emit(topic, message).toPromise();
      console.log('Message sent successfully:', result);
    } catch (e) {
      Logger.error(e);
    }
  }
}
