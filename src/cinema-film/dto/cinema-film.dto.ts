import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateCinemaFilmSeatWithCinemaFilmDto } from './cinema-film-seat.dto';

export class CreateCinemaFilmDto {
  @IsInt()
  filmId: number;

  @IsInt()
  roomId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsDate({ each: true })
  @Transform(({ value }) => value.map((v) => new Date(v)))
  premieres: Date[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCinemaFilmSeatWithCinemaFilmDto)
  seats?: CreateCinemaFilmSeatWithCinemaFilmDto[];
}

export class UpdateCinemaFilmDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsDate({ each: true })
  @Transform(({ value }) => value.map((v) => new Date(v)))
  premieres?: Date[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCinemaFilmSeatWithCinemaFilmDto)
  seats?: CreateCinemaFilmSeatWithCinemaFilmDto[];
}
