import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { stringToIntTransform } from 'src/common/transformers';

export enum FilmInclude {
  Actors = 'actors',
}

export const filmIncludes = Object.values(FilmInclude);

export class FilmQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(FilmInclude, { each: true })
  @Transform(({ value }) => value.split(','))
  includes?: FilmInclude[];
}

export class FilmPremiereQueryDto extends FilmQueryDto {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Transform(stringToIntTransform)
  ownerId?: number;
}
