import { Language } from '@googlemaps/google-maps-services-js';
import { IsLocale, IsOptional, IsString, MaxLength } from 'class-validator';

export class PlaceDetailsInputDto {
  @IsString()
  @MaxLength(1000)
  placeId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sessionToken?: string;

  @IsOptional()
  @IsLocale()
  language?: Language;
}
