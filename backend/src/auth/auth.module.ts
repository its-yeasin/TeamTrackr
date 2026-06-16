import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Module({
  imports: [
    // Always use the same strategy (jwt) for all endpoints.
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,

        signOptions: {
          // Tokens will expire after 15 minutes
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, AuthService, RefreshTokenGuard],
  exports: [JwtStrategy, PassportModule, RefreshTokenGuard],
  controllers: [],
})
export class AuthModule {}
