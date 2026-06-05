import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from "postgres"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from './schema'


export const DATABASE = "DATABASE"

@Module({
    providers: [
        {
            provide: DATABASE,
            useFactory(config: ConfigService) {
                const connectionString = config.get<string>("DATABASE_URL")!;
                const client = postgres(connectionString)

                return drizzle(client, {
                    schema
                })
            },
            inject: [ConfigService]
        }
    ]
})
export class DatabaseModule { }
