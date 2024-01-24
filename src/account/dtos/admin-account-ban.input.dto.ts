import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminAccountBanInputDto {
  @IsBoolean()
  isBanned: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
