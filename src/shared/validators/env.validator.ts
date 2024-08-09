import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export function validateEnv() {
  dotenv.config();

  const envExample = fs.readFileSync('.env.example', 'utf-8');

  const requiredEnvVars = envExample
    .split('\n')
    .filter((line) => {
      const trimmedLine = line.trim();
      return trimmedLine && !trimmedLine.startsWith('#');
    })
    .map((line) => line.split('=')[0].trim());

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      Logger.error(`Missing environment variable: ${envVar}`);
      Logger.error('Please make sure you have all the environment variables from the .env.example file.');
      process.exit(1);
    }
  });
}
