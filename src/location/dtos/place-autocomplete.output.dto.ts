import { Expose } from 'class-transformer';

export class PlaceAutocompleteOutputDto {
  @Expose()
  description: string;

  @Expose()
  placeId: string;
}
