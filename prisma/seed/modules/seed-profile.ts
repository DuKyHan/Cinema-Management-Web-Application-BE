import { fakerVI } from '@faker-js/faker';
import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { Account, Location, PrismaClient, Profile } from '@prisma/client';
import { readFileSync } from 'fs';
import _ from 'lodash';
import path from 'path';
import { Gender } from '../../../src/profile/constants';
import { generateLocation, generateViName } from '../utils';
import { seedFiles } from './seed-file';

export const seedProfiles = async (
  prisma: PrismaClient,
  accounts: Account[],
  options?: {
    importantAccountIds?: number[];
    runWithoutDb?: boolean;
  },
) => {
  const locations: Location[] = Array.from({ length: accounts.length }).map(
    () => {
      const loc = generateLocation();
      return {
        id: loc.id,
        addressLine1: [loc.addressLine1, loc.locality, loc.region].join(', '),
        addressLine2: null,
        locality: null,
        region: null,
        country: loc.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        createdAt: loc.createdAt,
        updatedAt: loc.updatedAt,
      };
    },
  );
  const profileTemplates = loadProfiles();

  const profileAvatars = accounts.map((account) => {
    return fakerEn.helpers.weightedArrayElement([
      { weight: 2, value: true },
      { weight: 1, value: false },
    ]);
  });
  const avatars = await seedFiles(
    prisma,
    './tmp/images/profile-avatar',
    {
      downloadOption: {
        url: fakerEn.image.avatar(),
      },
      count: profileAvatars.reduce((acc, cur) => acc + (cur ? 1 : 0), 0),
    },
    {
      skipInsertIntoDatabase: options?.runWithoutDb,
    },
  );

  let avatarIndex = 0;

  const profiles: Profile[] = accounts.map((account, profileIndex) => {
    const createdAt = fakerEn.date.between({
      from: account.createdAt ?? new Date(),
      to: new Date(),
    });
    const updatedAt = fakerEn.date.between({ from: createdAt, to: new Date() });
    const gender = _.sample(Object.values(Gender)) ?? Gender.Male;
    let genderName: 'male' | 'female';
    if (gender === Gender.Male) {
      genderName = 'male';
    } else if (gender === Gender.Female) {
      genderName = 'female';
    } else {
      genderName = _.sample(['male', 'female']) ?? 'male';
    }
    const { firstName, lastName } = generateViName(genderName);

    const hasAvatar = profileAvatars[profileIndex];

    const res = {
      id: account.id,
      username: fakerEn.internet.userName(),
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: fakerEn.date.between({ from: '1950-01-01', to: new Date() }),
      gender: gender,
      bio: profileTemplates[profileIndex % profileTemplates.length].bio,
      phoneNumber: fakerVI.phone.number('+84#########'),
      createdAt: createdAt,
      updatedAt: updatedAt,
      locationId: locations[profileIndex].id,
      avatarId: hasAvatar ? avatars[avatarIndex]?.id ?? null : null,
    };

    if (hasAvatar) {
      avatarIndex++;
    }

    return res;
  });

  if (options?.runWithoutDb) {
    return {
      locations,
      profiles,
    };
  }

  await prisma.location.createMany({
    data: locations,
  });

  await prisma.profile.createMany({
    data: profiles,
  });

  return {
    locations,
    profiles,
  };
};

class ProfileTemplate {
  bio: string;
}

const loadProfiles = () => {
  const lines = readFileSync(
    path.join(__dirname, '../assets/profile-bio.txt'),
    'utf-8',
  ).split('\n');
  const profileTemplates: ProfileTemplate[] = [];
  lines.forEach((line) => {
    if (line.trim().length === 0) {
      return;
    }
    const profileTemplate = new ProfileTemplate();
    profileTemplate.bio = line;
    profileTemplates.push(profileTemplate);
  });

  return profileTemplates;
};
