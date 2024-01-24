import { fakerEN } from '@faker-js/faker';
import { Account, Cinema, CinemaBrand, Location } from '@prisma/client';
import { CinemaStatus, cinemaStatuses } from 'src/cinema/constants';
import { AppPrismaClient } from 'src/prisma';
import {
  generateLocation,
  getNextCinemaBrandId,
  getNextCinemaId,
} from '../utils';
import { seedFiles } from './seed-file';

const seedCinemaBrands = async (
  prisma: AppPrismaClient,
  data: {
    defaultAccounts: Account[];
    accounts: Account[];
    modAccounts: Account[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const cinemaBrands: CinemaBrand[] = data.modAccounts.map((account) => {
    return {
      id: getNextCinemaBrandId(),
      name: fakerEN.company.name(),
      ownerId: account.id,
      logo: null,
    };
  });
  const cinemaBrandLogos = await seedFiles(
    prisma,
    '../tmp/cinema-brand-logo',
    {
      downloadOption: {
        url: fakerEN.image.urlLoremFlickr({
          width: 200,
          height: 200,
          category: 'cinema',
        }),
      },
      count: cinemaBrands.length,
    },
    {
      skipInsertIntoDatabase: options?.skipInsertIntoDatabase,
    },
  );
  cinemaBrands.forEach((cinemaBrand, index) => {
    cinemaBrand.logo = cinemaBrandLogos[index]!.id;
  });

  if (options?.skipInsertIntoDatabase) {
    return { cinemaBrands, cinemaBrandLogos };
  }

  await prisma.cinemaBrand.createMany({
    data: cinemaBrands,
  });

  return { cinemaBrands, cinemaBrandLogos };
};

const disableComments = [
  'Cinema is not operating',
  'Cinema has been closed',
  'Request from cinema owner',
  'Complaint from customer',
];

export const seedCinemas = async (
  prisma: AppPrismaClient,
  data: {
    defaultAccounts: Account[];
    accounts: Account[];
    modAccounts: Account[];
    adminAccounts: Account[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { cinemaBrands, cinemaBrandLogos } = await seedCinemaBrands(
    prisma,
    data,
    options,
  );

  const numberOfCinemas = fakerEN.number.int({ min: 10, max: 20 });
  const cinemas: Cinema[] = [];
  const locations: Location[] = [];
  const commentTemplates = ["Cinema's is very good", 'OK'];

  cinemaBrands.forEach((cinemaBrand, index) => {
    const location = generateLocation();
    locations.push(location);

    const status = fakerEN.helpers.arrayElement(cinemaStatuses);
    const isDisabled = fakerEN.helpers.weightedArrayElement([
      {
        weight: 1,
        value: true,
      },
      {
        weight: 5,
        value: false,
      },
    ]);
    const disabledBy = isDisabled
      ? fakerEN.helpers.arrayElement(data.adminAccounts)
      : null;

    const createdAt = fakerEN.date.between({
      from: new Date('2000-01-01'),
      to: new Date(),
    });
    const updatedAt = fakerEN.date.between({
      from: createdAt,
      to: new Date(),
    });
    cinemas.push({
      id: getNextCinemaId(),
      name: fakerEN.company.name(),
      banner: null,
      locationId: location.id,
      description: fakerEN.lorem.paragraph({ min: 1, max: 3 }),
      status: status,
      isDisabled: isDisabled,
      disabledBy: disabledBy?.id ?? null,
      disabledComment: isDisabled
        ? fakerEN.helpers.arrayElement(disableComments)
        : null,
      createdAt: createdAt,
      updatedAt: updatedAt,
      verifierId: fakerEN.helpers.arrayElement(data.adminAccounts).id,
      verifierComment:
        status === CinemaStatus.Rejected
          ? fakerEN.helpers.arrayElement(commentTemplates)
          : null,
      cinemaBrandId: fakerEN.helpers.arrayElement(cinemaBrands).id,
    });
  });

  const bannerIds = await seedFiles(
    prisma,
    '../tmp/cinema-banner',
    {
      downloadOption: {
        url: fakerEN.image.urlLoremFlickr({
          width: 1280,
          height: 720,
          category: 'cinema',
        }),
      },
      count: cinemas.length,
    },
    {
      skipInsertIntoDatabase: options?.skipInsertIntoDatabase,
    },
  );

  cinemas.forEach((cinema, index) => {
    cinema.banner = bannerIds[index]!.id;
  });

  if (options?.skipInsertIntoDatabase) {
    return { cinemaBrands, cinemas, locations };
  }

  await prisma.location.createMany({
    data: locations,
  });

  await prisma.cinema.createMany({
    data: cinemas,
  });

  return {
    cinemaBrands,
    cinemas,
  };
};
