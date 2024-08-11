import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaProducerService } from './kafka.producer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
