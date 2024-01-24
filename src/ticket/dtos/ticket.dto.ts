import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';

export class CreateFoodBeverageDto {
  @IsInt()
  id: number;

  @IsInt()
  quantity: number;
}

export class CreateTicketDto {
  @IsInt()
  seatId: number;

  @IsInt()
  premiereId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFoodBeverageDto)
  foodBeverages?: CreateFoodBeverageDto[];
}
