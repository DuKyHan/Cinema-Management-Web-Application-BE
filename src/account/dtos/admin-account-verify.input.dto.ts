import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminAccountVerifyInputDto {
  @IsBoolean()
  isVerified: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
