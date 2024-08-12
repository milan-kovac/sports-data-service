import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { validateEnv } from './shared/validators/env.validator';
import { AllExceptionsFilter } from './shared/filters/all.exceptions.filter';

async function bootstrap() {
  // Validates environment variables to ensure all required configurations are set correctly
  validateEnv();

  // Creating an application
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger config
  const config = new DocumentBuilder().setTitle('167PLUTO').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('API', app, document);

  // Launching the application
  await app.listen(process.env.PORT);
  const appUrl = await app.getUrl();

  Logger.verbose(`🚀 Application is on: ${appUrl}`);
  Logger.verbose(`🛸 Swagger is on: ${appUrl}/api`);
}
bootstrap();
