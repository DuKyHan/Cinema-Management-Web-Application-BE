import { fakerEN } from '@faker-js/faker';
import {
  FoodAndBeverage,
  PrismaClient,
  Ticket,
  TicketFoodAndBeverage,
} from '@prisma/client';

export const seedTicketFoods = async (
  prisma: PrismaClient,
  data: {
    tickets: Ticket[];
    foods: FoodAndBeverage[];
  },
  options: { skipInsertIntoDatabase?: boolean },
) => {
  const { tickets, foods } = data;

  const ticketFoods: TicketFoodAndBeverage[] = [];

  tickets.map((ticket) => {
    const purchasedFoods = fakerEN.helpers.arrayElements(foods, {
      min: 0,
      max: 3,
    });

    if (purchasedFoods.length < 1) {
      return;
    }

    purchasedFoods.forEach((food) => {
      ticketFoods.push({
        ticketId: ticket.id,
        foodAndBeverageId: food.id,
        quantity: fakerEN.number.int({ min: 1, max: 2 }),
      });
    });
  });

  if (options.skipInsertIntoDatabase) {
    return { ticketFoods };
  }

  await prisma.ticketFoodAndBeverage.createMany({
    data: ticketFoods,
  });

  return { ticketFoods };
};
