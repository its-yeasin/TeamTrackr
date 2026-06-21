import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { roleEnum } from 'src/database/schema';

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
  @IsIn(roleEnum.enumValues, {
    message: `Role must be one of the following: ${roleEnum.enumValues.join(', ')}`,
  })
  role: string;

  @IsOptional()
  @IsDateString({}, { message: 'JoinedAt must be a valid date' })
  joinedAt: Date;
}
