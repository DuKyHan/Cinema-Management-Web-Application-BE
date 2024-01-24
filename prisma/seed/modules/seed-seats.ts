import { fakerEN } from '@faker-js/faker';
import { PrismaClient, Room, Seat } from '@prisma/client';
import { SeatStatus } from 'src/seat/constants';
import { getNextSeatId } from '../utils';

export const seedSeats = async (
  prisma: PrismaClient,
  data: { rooms: Room[] },
  options: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { rooms } = data;
  const seats: Seat[] = [];

  const seatWeight = [
    {
      weight: 20,
      value: SeatStatus.Available,
    },
    {
      weight: 1,
      value: SeatStatus.Unavailable,
    },
  ];

  rooms.forEach((room) => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 20; j++) {
        seats.push({
          seatId: getNextSeatId(),
          roomId: room.roomId,
          name: `${String.fromCharCode(65 + i)}${j + 1}`,
          row: i,
          column: j,
          status:
            j == 15 && (i == 0 || i == 1 || i == 2)
              ? SeatStatus.Empty
              : fakerEN.helpers.weightedArrayElement(seatWeight),
        });
      }
    }
  });

  if (options.skipInsertIntoDatabase) {
    return { seats };
  }

  await prisma.seat.createMany({
    data: seats,
    skipDuplicates: true,
  });

  return { seats };
};
