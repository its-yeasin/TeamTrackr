import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export const DATABASE_TOKEN = 'DATABASE_TOKEN';

@Global() // this module can be used over the whole project
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory(config: ConfigService) {
        const connectionString = config.get<string>('DATABASE_URL')!;
        const client = postgres(connectionString);

        return drizzle(client, {
          schema,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
