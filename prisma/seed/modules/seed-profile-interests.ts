import { fakerEN } from '@faker-js/faker';
import { Genre, InterestedGenres, PrismaClient, Profile } from '@prisma/client';

export const seedProfileInterests = async (
  prisma: PrismaClient,
  data: {
    profiles: Profile[];
    genres: Genre[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { profiles, genres } = data;

  const profileInterests: InterestedGenres[] = profiles
    .map((profile) => {
      return fakerEN.helpers.arrayElements(genres).map((genre) => ({
        profileId: profile.id,
        genreId: genre.id,
      }));
    })
    .flat();

  if (options?.skipInsertIntoDatabase) {
    return { profileInterests };
  }

  await prisma.interestedGenres.createMany({
    data: profileInterests,
  });

  return { profileInterests };
};
