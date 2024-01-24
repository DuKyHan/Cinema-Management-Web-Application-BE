import { Expose } from 'class-transformer';

export class AddressComponentOutputDto {
  @Expose()
  longName: string;

  @Expose()
  shortName: string;

  @Expose()
  types: string[];
}
