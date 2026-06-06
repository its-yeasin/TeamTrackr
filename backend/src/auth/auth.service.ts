import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { RegisterDto } from './dto/RegisterDto';
import { refreshTokens, TNewUser, users } from 'src/database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'node_modules/bcryptjs';
import { LoginDto } from './dto/LoginDto';
import { JwtPayload } from './strategy/jwt.strategy';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE_TOKEN')
    private readonly db: TPgDatabase,
    private readonly jwtService: JwtService,
  ) {}

  // Register new user
  async register(dto: RegisterDto) {
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const payload: TNewUser = {
      name: dto.name,
      email: dto.email,
      passwordHash,
    };

    const [newUser] = await this.db.insert(users).values(payload).returning(); // return the newly created user

    const { passwordHash: _pw, ...restData } = newUser;

    return restData;
  }

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    const isPasswordValid = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Generate a secure random refresh token
    const refreshToken = randomBytes(64).toString('hex');

    // Store the refresh token in the database
    await this.db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      // Set expiration to 7 days
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(oldToken: string) {
    const [storedToken] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, oldToken));

    if (
      !storedToken ||
      storedToken.isUsed ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Mark the old token as used
    await this.db
      .update(refreshTokens)
      .set({ isUsed: true })
      .where(eq(refreshTokens.id, storedToken.id));

    // Fetch the user associated with the refresh token
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, storedToken.userId));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload: JwtPayload = {
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Generate a new refresh token
    const newRefreshToken = randomBytes(64).toString('hex');

    // Store the new refresh token in the database
    await this.db.insert(refreshTokens).values({
      userId: user.id,
      token: newRefreshToken,
      // Set expiration to 7 days
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getProfile(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Strip password hash before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _pw, ...restData } = user;
    return restData;
  }
}
