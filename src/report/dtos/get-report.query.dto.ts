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
import { CountQueryDto } from 'src/common/dtos/count.dto';
import { stringToBooleanTransform } from 'src/common/transformers';
import {
  ReportStatus,
  ReportType,
  reportStatuses,
  reportTypes,
} from '../constants';

export enum GetReportQuerySort {
  createdAtAsc = 'createdAt',
  createdAtDesc = '-createdAt',
  updatedAtAsc = 'updatedAt',
  updatedAtDesc = '-updatedAt',
}

export const getReportQuerySorts = Object.values(GetReportQuerySort);

export enum GetReportQueryInclude {
  Reporter = 'reporter',
  Reviewer = 'reviewer',
  Message = 'message',
}

export const getReportQueryIncludes = Object.values(GetReportQueryInclude);

export class BaseGetReportQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(GetReportQueryInclude, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(getReportQueryIncludes.length)
  @Transform(({ value }) => value.split(','))
  include?: GetReportQueryInclude[];
}

export class GetReportQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  @Transform(({ value }) => value.split(',').map(parseInt))
  id?: number[];

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  reporterId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  mine?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isReviewer?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ReportType, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(reportTypes.length)
  @Transform(({ value }) => value.split(','))
  type?: ReportType[];

  @IsOptional()
  @IsArray()
  @IsEnum(ReportStatus, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(reportStatuses.length)
  @Transform(({ value }) => value.split(','))
  status?: ReportStatus[];

  @IsOptional()
  @IsArray()
  @IsEnum(GetReportQueryInclude, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(getReportQueryIncludes.length)
  @Transform(({ value }) => value.split(','))
  include?: GetReportQueryInclude[];

  @IsOptional()
  @IsEnum(GetReportQuerySort)
  sort?: GetReportQuerySort;
}

export class CountReportQueryDto extends CountQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(ReportType, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(reportTypes.length)
  @Transform(({ value }) => value.split(','))
  type?: ReportType[];

  @IsOptional()
  @IsArray()
  @IsEnum(ReportStatus, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(reportStatuses.length)
  @Transform(({ value }) => value.split(','))
  status?: ReportStatus[];
}
