import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IsFileId } from 'src/file/validators';
import { ReportType } from '../constants';

export class CreateReportMessageInputDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(16)
  @IsFileId({ each: true })
  fileIds?: number[];
}

export class CreateReportInputDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsString()
  @MaxLength(256)
  title: string;

  @Type(() => CreateReportMessageInputDto)
  @ValidateNested()
  message: CreateReportMessageInputDto;
}

export class UpdateReportStatusInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
