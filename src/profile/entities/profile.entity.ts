import { Gender } from '../constants/profile.constant';

export class Profile {
  accountId: number;

  username: string;

  phoneNumber: string;

  firstName: string;

  lastName: string;

  dateOfBirth: Date;

  gender: Gender;

  bio: string;

  createdAt: Date;

  updatedAt: Date;
}
