
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Client } from '@googlemaps/google-maps-services-js';
import { RequestContext } from '../../common/request-context';
import { PrismaService } from '../../prisma';
import {
  GeocodeInputDto,
  GeocodeOutputDto,
  PlaceAutocompleteInputDto,
  PlaceAutocompleteOutputDto,
  PlaceDetailsInputDto,
  PlaceDetailsOutputDto,
  ReverseGeocodeInputDto,
  ReverseGeocodeOutputDto,
  UpdateLocationInputDto,
} from '../dtos';
import { CreateLocationInputDto } from '../dtos/create-location-input.dto';
import { LocationOutputDto } from '../dtos/location-output.dto';
import { InvalidCoordinateException } from '../exceptions';
import googleMapsConfig from 'src/common/configs/subconfigs/google-maps.config';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';

@Injectable()
export class LocationService extends AbstractService {
  private readonly client: Client;
  private readonly apiKey: string;

  constructor(
    logger: AppLogger,
    @Inject(googleMapsConfig.KEY)
    private readonly googleMapsConfigApi: ConfigType<typeof googleMapsConfig>,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
    this.client = new Client();
    this.apiKey = googleMapsConfigApi.apiKey;
  }

  async create(
    context: RequestContext,
    dto: CreateLocationInputDto,
  ): Promise<LocationOutputDto> {
    this.logCaller(context, this.create);
    if (
      (dto.longitude == null && dto.latitude != null) ||
      (dto.longitude != null && dto.latitude == null)
    ) {
      throw new InvalidCoordinateException();
    }
    const location = await this.prisma.location.create({ data: dto });
    return this.output(LocationOutputDto, location);
  }

  async createMany(
    context: RequestContext,
    dtos: CreateLocationInputDto[],
  ): Promise<LocationOutputDto[]> {
    this.logCaller(context, this.createMany);
    for (const dto of dtos) {
      if (
        (dto.longitude == null && dto.latitude != null) ||
        (dto.longitude != null && dto.latitude == null)
      ) {
        throw new InvalidCoordinateException();
      }
    }
    const locations = await this.prisma.$transaction(
      dtos.map((dto) => this.prisma.location.create({ data: dto })),
    );
    return this.outputArray(LocationOutputDto, locations);
  }

  async createManyTransaction(
    context: RequestContext,
    dtos: CreateLocationInputDto[],
    transaction: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ): Promise<LocationOutputDto[]> {
    this.logCaller(context, this.createMany);
    for (const dto of dtos) {
      if (
        (dto.longitude == null && dto.latitude != null) ||
        (dto.longitude != null && dto.latitude == null)
      ) {
        throw new InvalidCoordinateException();
      }
    }
    const locations: any[] = [];
    for (const dto of dtos) {
      const location = await transaction.location.create({ data: dto });
      locations.push(location);
    }

    return this.outputArray(LocationOutputDto, locations);
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<LocationOutputDto> {
    this.logCaller(context, this.getById);
    return this.output(
      LocationOutputDto,
      await this.prisma.location.findUnique({ where: { id: id } }),
    );
  }

  async getByIds(ids: number[]): Promise<LocationOutputDto[]> {
    return this.outputArray(
      LocationOutputDto,
      await this.prisma.location.findMany({ where: { id: { in: ids } } }),
    );
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateLocationInputDto,
  ): Promise<LocationOutputDto> {
    this.logCaller(context, this.update);
    const location = await this.prisma.location.update({
      where: {
        id: id,
      },
      data: dto,
    });
    return this.output(LocationOutputDto, location);
  }

  async delete(
    context: RequestContext,
    id: number,
  ): Promise<LocationOutputDto> {
    this.logCaller(context, this.delete);
    const location = this.prisma.location.delete({
      where: {
        id: id,
      },
    });
    return this.output(LocationOutputDto, location);
  }

  async geocode(context: RequestContext, dto: GeocodeInputDto) {
    this.logCaller(context, this.geocode);
    const response = await this.client.geocode({
      params: {
        address: dto.address,
        key: this.apiKey,
        language: dto.language,
      },
    });
    const output: GeocodeOutputDto[] = response.data.results.map((r) => ({
      addressComponents: r.address_components.map((ac) => ({
        longName: ac.long_name,
        shortName: ac.short_name,
        types: ac.types,
      })),
      formattedAddress: r.formatted_address,
      latitude: r.geometry.location.lat,
      longitude: r.geometry.location.lng,
    }));
    return output;
  }

  async reverseGeocode(context: RequestContext, dto: ReverseGeocodeInputDto) {
    this.logCaller(context, this.geocode);
    const response = await this.client.reverseGeocode({
      params: {
        latlng: {
          lat: dto.latitude,
          lng: dto.longitude,
        },
        place_id: dto.placeId,
        key: this.apiKey,
        language: dto.language,
      },
    });
    const output: ReverseGeocodeOutputDto[] = response.data.results.map(
      (r) => ({
        addressComponents: r.address_components.map((ac) => ({
          longName: ac.long_name,
          shortName: ac.short_name,
          types: ac.types,
        })),
        formattedAddress: r.formatted_address,
        latitude: r.geometry.location.lat,
        longitude: r.geometry.location.lng,
      }),
    );
    return output;
  }

  async placeAutocomplete(
    context: RequestContext,
    dto: PlaceAutocompleteInputDto,
  ) {
    this.logCaller(context, this.placeAutocomplete);
    const response = await this.client.placeAutocomplete({
      params: {
        input: dto.input,
        key: this.apiKey,
        sessiontoken: dto.sessionToken,
        language: dto.language,
      },
    });
    const predictions = response.data.predictions;
    return this.outputArray(
      PlaceAutocompleteOutputDto,
      predictions.map((p) => ({
        description: p.description,
        placeId: p.place_id,
      })),
    );
  }

  async placeDetails(context: RequestContext, dto: PlaceDetailsInputDto) {
    this.logCaller(context, this.placeDetails);
    const response = await this.client.placeDetails({
      params: {
        place_id: dto.placeId,
        key: this.apiKey,
        sessiontoken: dto.sessionToken,
        language: dto.language,
      },
    });
    const output: PlaceDetailsOutputDto = {
      formattedAddress: response.data.result.formatted_address,
      latitude: response.data.result.geometry?.location.lat,
      longitude: response.data.result.geometry?.location.lng,
      addressComponents: response.data.result.address_components?.map((c) => ({
        longName: c.long_name,
        shortName: c.short_name,
        types: c.types,
      })),
    };
    return output;
  }
}
