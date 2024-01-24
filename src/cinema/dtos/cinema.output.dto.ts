import { Expose, Type } from 'class-transformer';
import { CinemaBrandOutputDto } from 'src/cinema-brand/dtos/cinema-brand.output.dto';
import { LocationOutputDto } from 'src/location/dtos';
import { CinemaStatus } from '../constants';

export class CinemaOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  status: CinemaStatus;

  @Expose()
  verifierComment?: string;

  @Expose()
  isDisabled: boolean;

  @Expose()
  disabledComment?: string;

  @Expose()
  @Type(() => LocationOutputDto)
  location?: LocationOutputDto;

  @Expose()
  @Type(() => CinemaBrandOutputDto)
  cinemaBrand: CinemaBrandOutputDto;
}
