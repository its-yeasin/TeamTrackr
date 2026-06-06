import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TRole } from "src/database/schema";
import * as schema from "../../database/schema"
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { TPgDatabase } from "src/common/interfaces/db";

export type JwtPayload = {
    name: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(
        config: ConfigService,
        @Inject("DATABASE_TOKEN")
        private readonly db: TPgDatabase
    ){
        super({
            // Extract the JWT from the Authorization header as a Bearer token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Ensure expired tokens are rejected
            secretOrKey: config.get<string>("JWT_SECRET")!,

        })
    }

     async validate(payload: JwtPayload) {

        const [user] = await this.db.select()
        .from(schema.users)
        .where(eq(schema.users.email, payload.email));

        if(!user) {
            throw new UnauthorizedException("User not found")
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
        
    }
}