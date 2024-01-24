import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateLocationInputDto } from 'src/location/dtos';

export class CreateCinemaDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationInputDto)
  location?: CreateLocationInputDto;
}

export class UpdateCinemaDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationInputDto)
  location?: CreateLocationInputDto;
}

export class ChangeCinemaStatusDto {
  @IsOptional()
  @IsString()
  comment?: string;
}
