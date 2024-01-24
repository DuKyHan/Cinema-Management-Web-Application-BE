import { fakerEN } from '@faker-js/faker';
import { Cinema, CinemaFilm, Film, PrismaClient, Room } from '@prisma/client';
import { CinemaStatus } from 'src/cinema/constants';
import { getNextCinemaFilmId } from '../utils';

export const seedCinemaFilms = async (
  prisma: PrismaClient,
  data: {
    cinemas: Cinema[];
    films: Film[];
    rooms: Room[];
  },
  options: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { cinemas, films } = data;

  const cinemaFilms: CinemaFilm[] = cinemas
    .filter((c) => c.status === CinemaStatus.Verified)
    .map((cinema) => {
      const cinemaRooms = data.rooms.filter(
        (room) => room.cinemaId === cinema.id,
      );
      return films.map((film) => {
        return {
          id: getNextCinemaFilmId(),
          cinemaId: cinema.id,
          filmId: film.id,
          roomId: fakerEN.helpers.arrayElement(cinemaRooms).roomId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
    })
    .flat();

  if (options.skipInsertIntoDatabase) {
    return { cinemaFilms };
  }

  await prisma.cinemaFilm.createMany({
    data: cinemaFilms,
  });

  return { cinemaFilms };
};
