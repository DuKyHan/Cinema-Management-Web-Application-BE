import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  stringToIntArrayTransform,
  stringToIntTransform,
  stringToStringArrayTransform,
} from 'src/common/transformers';
import { PaginationQueryDto } from '../../common/dtos';

export enum FoodQueryInclude {
  Cinema = 'cinema',
}

export const foodQueryIncludes = Object.values(FoodQueryInclude);

export class FoodQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  ids?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(128)
  @IsInt({ each: true })
  @Transform(stringToIntArrayTransform)
  excludeId?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(256)
  search?: string;

  @IsOptional()
  @IsInt()
  @Transform(stringToIntTransform)
  cinemaId?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(foodQueryIncludes.length)
  @IsEnum(FoodQueryInclude, { each: true })
  @Transform(stringToStringArrayTransform)
  includes?: FoodQueryInclude[];
}
