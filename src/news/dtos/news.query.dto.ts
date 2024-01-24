import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import {
  stringToBooleanTransform,
  stringToIntArrayTransform,
  stringToIntTransform,
  stringToStringArrayTransform,
} from 'src/common/transformers';
import { NewsStatus, NewsType, newsTypes } from '../constants';

export enum NewsInclude {
  Author = 'author',
  Organization = 'organization',
  Reference = 'reference',
}

export const newsIncludes = Object.values(NewsInclude);

export enum NewsSort {
  RelevanceAsc = 'relevance',
  RelevanceDesc = '-relevance',
  PopularityAsc = 'popularity',
  PopularityDesc = '-popularity',
  DateAsc = 'date',
  DateDesc = '-date',
  ViewsAsc = 'views',
  ViewsDesc = '-views',
}

export class NewsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(NewsInclude, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(newsIncludes.length)
  @Transform(stringToStringArrayTransform)
  includes?: NewsInclude[];
}

export class ManyNewsQueryDto extends NewsQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  id?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  excludeIds?: number[];

  @IsOptional()
  @IsArray()
  @IsEnum(NewsType, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(newsTypes.length)
  @Transform(stringToStringArrayTransform)
  type?: NewsType[];

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @IsOptional()
  @IsInt()
  @Transform(stringToIntTransform)
  authorId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsEnum(NewsSort)
  sort?: NewsSort;
}
