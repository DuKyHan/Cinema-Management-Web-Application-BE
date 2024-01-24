import { IsLocale, IsOptional, IsString, MaxLength } from 'class-validator';

export class GeocodeInputDto {
  @IsString()
  @MaxLength(1000)
  address: string;

  @IsOptional()
  @IsLocale()
  language?: string;
}
