import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerService } from './kafka.producer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        transport: Transport.KAFKA,
        name: 'KAFKA_PRODUCER',
        options: {
          client: {
            brokers: [process.env.KAFKA_BROKERS],
            retry: {
              retries: 8,
              initialRetryTime: 300,
              maxRetryTime: 30000,
              factor: 0.2,
            },
            connectionTimeout: 3000,
          },
          consumer: {
            groupId: 'nestjs-consumer-group',
            allowAutoTopicCreation: true,
            retry: {
              retries: 8,
              initialRetryTime: 300,
              maxRetryTime: 30000,
              factor: 0.2,
            },
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
