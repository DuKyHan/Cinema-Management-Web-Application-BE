import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { CreateCinemaBrandDto, UpdateCinemaBrandDto } from '../dtos';
import { CinemaBrandService } from '../services';

@Controller('cinema-brands')
export class CinemaBrandController {
  constructor(private readonly cinemaBrandService: CinemaBrandService) {}

  @Get('me')
  async getMyCinemaBrand(@ReqContext() context: RequestContext) {
    return this.cinemaBrandService.getMyCinemaBrand(context);
  }

  @Get(':id')
  async getCinemaBrand(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cinemaBrandService.getCinemaBrandById(context, id);
  }

  @Post()
  async createCinemaBrand(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateCinemaBrandDto,
  ) {
    return this.cinemaBrandService.createCinemaBrand(context, dto);
  }

  @Put(':id')
  async updateCinemaBrand(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCinemaBrandDto,
  ) {
    return this.cinemaBrandService.updateCinemaBrand(context, id, dto);
  }
}
