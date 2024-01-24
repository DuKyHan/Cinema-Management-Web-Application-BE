import { fakerEN } from '@faker-js/faker';
import {
  Account,
  CinemaFilmPremiere,
  CinemaFilmSeat,
  FoodAndBeverage,
  PrismaClient,
  Ticket,
  TicketFoodAndBeverage,
} from '@prisma/client';
import _ from 'lodash';
import { TicketStatus } from 'src/ticket/constants';
import { getNextTicketId } from '../utils';

export const seedTickets = async (
  prisma: PrismaClient,
  data: {
    userAccounts: Account[];
    cinemaFilmSeats: CinemaFilmSeat[];
    cinemaFilmPremieres: CinemaFilmPremiere[];
    foodAndBeverages: FoodAndBeverage[];
  },
  options: { skipInsertIntoDatabase?: boolean },
) => {
  const { cinemaFilmSeats, cinemaFilmPremieres, foodAndBeverages } = data;
  const userAccounts = [...data.userAccounts];

  const purchasedAccountIds = new Map<number, number>();

  const tickets: Ticket[] = [];
  const ticketFoodAndBeverages: TicketFoodAndBeverage[] = [];
  for (const cinemaSeat of cinemaFilmSeats) {
    if (userAccounts.length === 0) {
      break;
    }

    const isBought = fakerEN.datatype.boolean();

    if (!isBought) {
      continue;
    }

    const status = fakerEN.helpers.weightedArrayElement([
      {
        value: TicketStatus.Paid,
        weight: 10,
      },
      {
        value: TicketStatus.Cancelled,
        weight: 1,
      },
    ]);

    const account = fakerEN.helpers.arrayElement(userAccounts);
    const purchasedTimes = purchasedAccountIds.get(account.id) ?? 0;
    purchasedAccountIds.set(account.id, purchasedTimes + 1);

    if (purchasedTimes > 2) {
      userAccounts.splice(userAccounts.indexOf(account), 1);
    }

    const ticketId = getNextTicketId();

    let foodBeveragesPrice = 0;
    const foodBeverages = fakerEN.helpers.arrayElements(
      foodAndBeverages,
      fakerEN.number.int({ min: 0, max: 3 }),
    );
    ticketFoodAndBeverages.push(
      ...foodBeverages.map((item) => {
        const quantity = fakerEN.number.int({ min: 1, max: 3 });
        foodBeveragesPrice += quantity * item.price;

        return {
          ticketId: ticketId,
          foodAndBeverageId: item.id,
          quantity: quantity,
        };
      }),
    );

    const premiere = fakerEN.helpers.arrayElement(cinemaFilmPremieres);
    const createdAt = fakerEN.date.recent({
      days: 30,
      refDate: _.min([premiere.premiere, new Date()]),
    });

    tickets.push({
      id: ticketId,
      status: status,
      seatId: cinemaSeat.seatId,
      premiereId: premiere.id,
      price: cinemaSeat.price + foodBeveragesPrice,
      accountId: account.id,
      createdAt: createdAt,
      updatedAt: createdAt,
    });
  }

  if (options.skipInsertIntoDatabase) {
    return { tickets: tickets, ticketFoodAndBeverages: ticketFoodAndBeverages };
  }

  await prisma.ticket.createMany({
    data: tickets,
  });

  await prisma.ticketFoodAndBeverage.createMany({
    data: ticketFoodAndBeverages,
  });

  return { tickets: tickets, ticketFoodAndBeverages: ticketFoodAndBeverages };
};
