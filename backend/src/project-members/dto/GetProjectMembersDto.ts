import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetProjectMembersDto {
  @IsOptional()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsDateString({}, { message: 'JoinedAt must be a valid date' })
  joinedAt: Date;
}
