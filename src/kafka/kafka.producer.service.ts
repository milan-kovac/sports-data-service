import { Injectable, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { LogMethod } from 'src/shared/decorators/log.method.decorator';

@Injectable()
export class KafkaProducerService {
  private readonly kafkaInstance: Kafka;
  private producer: Producer;

  constructor() {
    this.kafkaInstance = new Kafka({
      clientId: 'kafka-client',
      brokers: [process.env.KAFKA_BROKERS],
      connectionTimeout: 3000,
      authenticationTimeout: 1000,
      reauthenticationThreshold: 10000,
    });

    this.producer = this.kafkaInstance.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
    } catch (e) {
      Logger.error('Failed to connect to Kafka.', e);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
    } catch (e) {
      Logger.error('Failed to disconnect to Kafka.', e);
    }
  }

  @LogMethod()
  async send(topic: string, value: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(value) }],
      });
    } catch (e) {
      Logger.error(`Failed to send message to topic "${topic}.`, e);
    }
  }
}
