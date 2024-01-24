import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateSeatWithRoomInputDto } from 'src/seat/dtos';

export class CreateRoomInputDto {
  @IsInt()
  cinemaId: number;

  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsArray()
  @Type(() => CreateSeatWithRoomInputDto)
  @ValidateNested({ each: true })
  seats?: CreateSeatWithRoomInputDto[];
}
