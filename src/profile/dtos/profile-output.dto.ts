import { Expose, Type } from 'class-transformer';

// import { LocationOutputDto } from '../../location/dtos';
import { GenreOutputDto } from 'src/genres/dtos/genre.output.dto';
import { LocationOutputDto } from 'src/location/dtos';
import { Gender } from '../constants/profile.constant';

export class ViewedGenreTimes {
  @Expose()
  @Type(() => GenreOutputDto)
  genre: GenreOutputDto;

  @Expose()
  duration: number;
}

export class ProfileOutputDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  gender: Gender;

  @Expose()
  bio: string;

  @Expose()
  @Type(() => LocationOutputDto)
  location: LocationOutputDto;

  @Expose()
  avatarId: number;

  // ----- Extra fields -----

  @Expose()
  email: string;

  @Expose()
  @Type(() => GenreOutputDto)
  interestedGenres: GenreOutputDto[];

  @Expose()
  @Type(() => ViewedGenreTimes)
  viewedGenreTimes: ViewedGenreTimes[];
}
