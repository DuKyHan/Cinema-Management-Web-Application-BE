import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateSeatWithRoomInputDto } from 'src/seat/dtos';

export class UpdateRoomInputDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @Type(() => CreateSeatWithRoomInputDto)
  @ValidateNested({ each: true })
  seats?: CreateSeatWithRoomInputDto[];
}
