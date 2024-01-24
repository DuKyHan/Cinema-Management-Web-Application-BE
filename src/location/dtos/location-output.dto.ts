import { Expose } from 'class-transformer';

export class LocationOutputDto {
  @Expose()
  id: number;

  @Expose()
  addressLine1?: string | null;

  @Expose()
  addressLine2?: string | null;

  @Expose()
  locality?: string | null;

  @Expose()
  region?: string | null;

  @Expose()
  country?: string | null;

  @Expose()
  latitude?: number | null;

  @Expose()
  longitude?: number | null;
}

export class ShortLocationOutputDto {
  @Expose()
  locality?: string | null;

  @Expose()
  region?: string | null;

  @Expose()
  country?: string | null;
}
