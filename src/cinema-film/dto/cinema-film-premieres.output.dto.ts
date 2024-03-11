import { Expose } from 'class-transformer';

export class CinemaFilmPremieresOutputDto {
  @Expose()
  id: number;

  @Expose()
  premiere: Date;

  @Expose()
  cinemaFilmId: number;
}
