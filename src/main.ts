import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { validateEnv } from './shared/validators/env.validator';

async function bootstrap() {
  validateEnv();

  // Creating an application
  const app = await NestFactory.create(AppModule);

  // Launching the application
  await app.listen(process.env.PORT);
  const appUrl = await app.getUrl();

  Logger.verbose(`🚀 Application is on: ${appUrl}`);
}
bootstrap();
