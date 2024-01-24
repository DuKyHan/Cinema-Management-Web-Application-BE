import { Expose } from 'class-transformer';

export class CinemaBrandOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  logo: number;

  @Expose()
  ownerId: number;
}
