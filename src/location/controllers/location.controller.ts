import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { ReqContext, RequestContext } from '../../common/request-context';
import {
  CreateLocationInputDto,
  GeocodeInputDto,
  PlaceAutocompleteInputDto,
  PlaceDetailsInputDto,
  ReverseGeocodeInputDto,
  UpdateLocationInputDto,
} from '../dtos';
import { LocationService } from '../services';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('geocode')
  async geocode(
    @ReqContext() context: RequestContext,
    @Body() dto: GeocodeInputDto,
  ) {
    return this.locationService.geocode(context, dto);
  }

  @Post('reverse-geocode')
  async reverseGeocode(
    @ReqContext() context: RequestContext,
    @Body() dto: ReverseGeocodeInputDto,
  ) {
    return this.locationService.reverseGeocode(context, dto);
  }

  @Post('place-autocomplete')
  async placeAutocomplete(
    @ReqContext() context: RequestContext,
    @Body() query: PlaceAutocompleteInputDto,
  ) {
    return this.locationService.placeAutocomplete(context, query);
  }

  @Post('place-details')
  async placeDetails(
    @ReqContext() context: RequestContext,
    @Body() query: PlaceDetailsInputDto,
  ) {
    return this.locationService.placeDetails(context, query);
  }

  @Get(':id')
  async get(@ReqContext() context: RequestContext, @Param('id') id: number) {
    return this.locationService.getById(context, id);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateLocationInputDto,
  ) {
    return this.locationService.create(context, dto);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateLocationInputDto,
  ) {
    return this.locationService.update(context, id, dto);
  }

  @Delete(':id')
  async delete(@ReqContext() context: RequestContext, @Param('id') id: number) {
    return this.locationService.delete(context, id);
  }
}
