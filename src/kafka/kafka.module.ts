import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerService } from './kafka.producer.service';
@Module({
  imports: [
    ClientsModule.register([
      {
        transport: Transport.KAFKA,
        name: 'KAFKA_PRODUCER',
        options: {
          client: {
            brokers: ['localhost:29092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
