import { Expose, Type } from 'class-transformer';
import { AddressComponentOutputDto } from './address-component.output.dto';

export class ReverseGeocodeOutputDto {
  @Expose()
  @Type(() => AddressComponentOutputDto)
  addressComponents?: AddressComponentOutputDto[];

  @Expose()
  formattedAddress?: string;

  @Expose()
  latitude?: number;

  @Expose()
  longitude?: number;
}
