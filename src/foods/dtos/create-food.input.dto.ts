import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFoodInputDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  @Min(0)
  @Max(10000)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  cinemaId: number;
}
