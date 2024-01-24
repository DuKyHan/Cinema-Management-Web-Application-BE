import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { stringToStringArrayTransform } from 'src/common/transformers';

export enum CinemaFilmInclude {
  Film = 'film',
  Cinema = 'cinema',
  Room = 'room',
  RoomSeats = 'room-seats',
  CinemaFilmSeats = 'cinema-film-seats',
  PurchasedSeats = 'purchased-seats',
}

export const cinemaFilmIncludes = Object.values(CinemaFilmInclude);

export class GetCinemaFilmsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(CinemaFilmInclude, { each: true })
  @ArrayMaxSize(cinemaFilmIncludes.length)
  @ArrayMinSize(1)
  @Transform(stringToStringArrayTransform)
  includes?: CinemaFilmInclude[];

  @IsOptional()
  @IsString()
  search?: string;
}
