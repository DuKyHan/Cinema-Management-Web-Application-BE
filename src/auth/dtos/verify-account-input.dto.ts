import { IsEmail, IsString } from 'class-validator';

export class VerifyAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  token: string;
}
