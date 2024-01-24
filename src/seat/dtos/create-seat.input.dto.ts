import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSeatWithRoomInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(2)
  @IsNotEmpty()
  @ApiProperty()
  name?: string;

  @IsInt()
  row: number;

  @IsInt()
  column: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  status: string;
}

export class CreateSeatInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(2)
  @IsNotEmpty()
  @ApiProperty()
  name?: string;

  @IsInt()
  row: number;

  @IsInt()
  column: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  status: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  roomId: number;
}
