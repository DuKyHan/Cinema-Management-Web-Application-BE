import { fakerEN } from '@faker-js/faker';
import { CinemaFilm, CinemaFilmPremiere, PrismaClient } from '@prisma/client';
import { getNextCinemaFilmPremiereId } from '../utils';

export const seedCinemaPremieres = async (
  prisma: PrismaClient,
  data: {
    cinemaFilms: CinemaFilm[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { cinemaFilms } = data;

  const cinemaPremieres: CinemaFilmPremiere[] = [];

  cinemaFilms.forEach((cinemaFilm) => {
    for (let i = 0; i < fakerEN.number.int({ min: 1, max: 3 }); i++) {
      cinemaPremieres.push({
        id: getNextCinemaFilmPremiereId(),
        cinemaFilmId: cinemaFilm.id,
        premiere: fakerEN.date.soon({ days: 90 }),
      });
    }
  });

  if (options?.skipInsertIntoDatabase) {
    return { cinemaPremieres };
  }

  await prisma.cinemaFilmPremiere.createMany({
    data: cinemaPremieres,
  });

  return { cinemaPremieres };
};
