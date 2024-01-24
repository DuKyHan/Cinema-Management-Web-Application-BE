import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { CreateFoodInputDto, FoodOutputDto, UpdateFoodInputDto } from '../dtos';
import { FoodQueryDto } from '../dtos/food.query.dto';
import { FoodService } from '../services';

@ApiTags('foods')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  async getAll(
    @ReqContext() context: RequestContext,
    @Query() query: FoodQueryDto,
  ) {
    return this.foodService.getAll(context, query);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.foodService.getFoodById(context, +id);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() createFoodDto: CreateFoodInputDto,
  ): Promise<FoodOutputDto> {
    return this.foodService.createFood(context, createFoodDto);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSeatDto: UpdateFoodInputDto,
  ) {
    return this.foodService.updateFood(context, id, updateSeatDto);
  }

  @Delete(':id')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.foodService.deleteFood(context, id);
  }
}
