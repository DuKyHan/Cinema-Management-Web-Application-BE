import { Expose } from 'class-transformer';

export class CinemaFilmSeatOutputDto {
  @Expose()
  cinemaFilmId: number;

  @Expose()
  seatId: number;

  @Expose()
  price: number;
}
