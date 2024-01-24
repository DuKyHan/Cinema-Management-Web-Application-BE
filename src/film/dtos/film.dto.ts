import { PartialType } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateFilmDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  AgeRestricted: string;

  @IsInt()
  Duration: number;

  @IsOptional()
  @IsString()
  TrailerLink?: string;

  @IsOptional()
  @IsInt()
  thumbnailId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actors?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  genres?: number[];
}

export class UpdateFilmDto extends PartialType(CreateFilmDto) {}
