import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { CreateLocationInputDto } from './create-location-input.dto';

export class UpdateLocationInputDto extends PartialType(
  CreateLocationInputDto,
) {}

export class UpdateLocationInputDtoWithIdDto extends UpdateLocationInputDto {
  @IsOptional()
  @IsNumber()
  id: number;
}
