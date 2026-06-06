import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: "Name should not be empty" })
    @MaxLength(50, { message: "Name should not exceed 50 characters" })
    @Transform(({ value }) => value.trim())
    name: string = "";

    @IsEmail({}, { message: 'Must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
    email: string = "";

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @MaxLength(100)
    password: string = ""


}