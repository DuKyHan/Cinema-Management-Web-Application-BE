import { IsLocale, IsOptional, IsString, MaxLength } from 'class-validator';

export class PlaceAutocompleteInputDto {
  @IsString()
  @MaxLength(1000)
  input: string;

  @IsOptional()
  @IsString()
  sessionToken?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsLocale()
  language?: string;
}
