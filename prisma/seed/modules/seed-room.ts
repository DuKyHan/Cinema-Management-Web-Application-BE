import { fakerEN } from '@faker-js/faker';
import { Cinema, PrismaClient, Room } from '@prisma/client';
import { CinemaStatus } from 'src/cinema/constants';
import { roomStatuses } from 'src/room/constants';
import { getNextRoomId } from '../utils';

export const seedRooms = async (
  prisma: PrismaClient,
  data: {
    cinemas: Cinema[];
  },
  options: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { cinemas } = data;
  const rooms: Room[] = [];

  cinemas.map((cinema) => {
    if (cinema.status !== CinemaStatus.Verified) {
      return;
    }

    for (let i = 0; i < 4; i++) {
      rooms.push({
        roomId: getNextRoomId(),
        name: `Room ${fakerEN.company.name()}`,
        status: fakerEN.helpers.arrayElement(roomStatuses),
        cinemaId: cinema.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  if (options.skipInsertIntoDatabase) {
    return { rooms };
  }

  await prisma.room.createMany({
    data: rooms,
    skipDuplicates: true,
  });

  return { rooms };
};
