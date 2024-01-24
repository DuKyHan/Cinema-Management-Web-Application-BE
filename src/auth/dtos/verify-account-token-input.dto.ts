import { IsEmail } from 'class-validator';

export class VerifyAccountTokenInputDto {
  @IsEmail()
  email: string;
}
