import { Expose } from 'class-transformer';

export class FilmOutputDto {
  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  AgeRestricted: string;

  @Expose()
  Duration: number;

  @Expose()
  TrailerLink?: string;

  @Expose()
  thumbnailId?: number;

  @Expose()
  actors?: string[];

  @Expose()
  genres?: number[];

  @Expose()
  genreNames?: string[];
}
