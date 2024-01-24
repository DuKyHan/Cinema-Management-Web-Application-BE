import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateCinemaFilmSeatDto {
  @IsInt()
  cinemaFilmId: number;

  @IsInt()
  seatId: number;

  @IsInt()
  @Min(0)
  price: number;
}

export class CreateCinemaFilmSeatWithCinemaFilmDto {
  @IsInt()
  seatId: number;

  @IsInt()
  @Min(0)
  price: number;
}

export class UpdateCinemaFilmSeatDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  price: number;
}
