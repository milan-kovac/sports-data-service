import 'dotenv/config';
import { DataSourceOptions, DataSource } from 'typeorm';
import { League } from 'src/league/league.entity';
import { Team } from 'src/team/team.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: true,
  entities: [League, Team],
  migrations: [`${process.cwd()}/dist/db/migrations/*{.ts,.js}`],
  migrationsRun: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
