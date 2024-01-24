import { fakerEN } from '@faker-js/faker';
import {
  CinemaFilm,
  CinemaFilmSeat,
  PrismaClient,
  Room,
  Seat,
} from '@prisma/client';

export const seedCinemaSeats = async (
  prisma: PrismaClient,
  data: {
    rooms: Room[];
    seats: Seat[];
    cinemaFilms: CinemaFilm[];
  },
  options: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { rooms, cinemaFilms, seats } = data;

  const cinemaFilmSeats: CinemaFilmSeat[] = cinemaFilms
    .map((cinemaFilm) => {
      const cinemaRoom = rooms.find(
        (room) => room.roomId === cinemaFilm.roomId,
      );

      if (!cinemaRoom) {
        return [];
      }

      const cinemaSeats = seats.filter(
        (seat) => seat.roomId === cinemaRoom.roomId,
      );

      return cinemaSeats.map((cinemaSeat) => {
        return {
          cinemaFilmId: cinemaFilm.id,
          seatId: cinemaSeat.seatId,
          price: fakerEN.number.int({ min: 5, max: 100 }) * 10000,
        };
      });
    })
    .flat();

  if (options.skipInsertIntoDatabase) {
    return { cinemaFilmSeats };
  }

  await prisma.cinemaFilmSeat.createMany({
    data: cinemaFilmSeats,
  });

  return { cinemaFilmSeats };
};
