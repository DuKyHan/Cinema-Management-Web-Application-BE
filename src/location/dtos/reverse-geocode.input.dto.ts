import { Language } from '@googlemaps/google-maps-services-js';
import {
  IsLatitude,
  IsLocale,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ReverseGeocodeInputDto {
  @IsOptional()
  @IsLatitude()
  latitude: number;

  @IsOptional()
  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  placeId: string;

  @IsOptional()
  @IsLocale()
  language?: Language;
}
