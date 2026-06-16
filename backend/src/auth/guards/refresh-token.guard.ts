import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Request } from 'express';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { refreshTokens } from 'src/database/schema';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    @Inject('DATABASE_TOKEN')
    private readonly db: TPgDatabase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['refresh-token'];

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('User not authenticated');
    }

    const [stored] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));

    if (
      !stored ||
      stored.isUsed ||
      stored.isRevoked ||
      stored.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return true;
  }
}
