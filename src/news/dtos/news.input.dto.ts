import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  NEWS_MAX_CONTENT_LENGTH,
  NEWS_MAX_TITLE_LENGTH,
  NewsContentFormat,
  NewsType,
} from '../constants';
import { validateValidNewsType } from '../validators';

export class CreateNewsInputDto {
  @IsEnum(NewsType)
  @ValidateIf(validateValidNewsType)
  type: NewsType;

  @IsString()
  @MaxLength(NEWS_MAX_TITLE_LENGTH)
  title: string;

  @IsString()
  @MaxLength(NEWS_MAX_CONTENT_LENGTH)
  content: string;

  @IsEnum(NewsContentFormat)
  contentFormat: NewsContentFormat;

  @IsOptional()
  @IsInt()
  thumbnail?: number;

  // @IsOptional()
  // @IsBoolean()
  // isPublished?: boolean;

  @IsOptional()
  @IsInt()
  filmId?: number;

  @IsOptional()
  @IsInt()
  cinemaId?: number;
}

export class UpdateNewsInputDto {
  @IsEnum(NewsType)
  @ValidateIf(validateValidNewsType)
  type: NewsType;

  @IsOptional()
  @IsString()
  @MaxLength(NEWS_MAX_TITLE_LENGTH)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(NEWS_MAX_CONTENT_LENGTH)
  content: string;

  @IsOptional()
  @IsEnum(NewsContentFormat)
  contentFormat: NewsContentFormat;

  @IsOptional()
  @IsInt()
  thumbnail?: number;

  // @IsOptional()
  // @IsBoolean()
  // isPublished?: boolean;

  @IsOptional()
  @IsInt()
  activityId?: number;
}

export class UpdateNewsStatusInputDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
