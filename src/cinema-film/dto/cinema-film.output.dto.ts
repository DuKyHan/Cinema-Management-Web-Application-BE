import { Expose, Type } from 'class-transformer';
import { CinemaOutputDto } from 'src/cinema/dtos/cinema.output.dto';
import { FilmOutputDto } from 'src/film/dtos/film.output.dto';
import { RoomOutputDto } from 'src/room/dtos';
import { CinemaFilmPremieresOutputDto } from './cinema-film-premieres.output.dto';
import { CinemaFilmSeatOutputDto } from './cinema-film-seat.output.dto';

export class CinemaFilmOutputDto {
  @Expose()
  id: number;

  @Expose()
  cinemaId: number;

  @Expose()
  filmId: number;

  @Expose()
  roomId: number;

  @Expose()
  @Type(() => CinemaFilmPremieresOutputDto)
  premieres?: CinemaFilmPremieresOutputDto[];

  @Expose()
  @Type(() => CinemaOutputDto)
  cinema?: CinemaOutputDto;

  @Expose()
  @Type(() => FilmOutputDto)
  film?: FilmOutputDto;

  @Expose()
  @Type(() => RoomOutputDto)
  room?: RoomOutputDto;

  @Expose()
  @Type(() => CinemaFilmSeatOutputDto)
  cinemaFilmSeats?: CinemaFilmSeatOutputDto[];

  @Expose()
  purchasedSeats?: number[];
}
