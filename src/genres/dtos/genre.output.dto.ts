import { Expose } from 'class-transformer';

export class GenreOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
