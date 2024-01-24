import { fakerEN } from '@faker-js/faker';
import { Cinema, FoodAndBeverage, PrismaClient } from '@prisma/client';
import { CinemaStatus } from 'src/cinema/constants';
import { getNextFoodAndBeverageId } from '../utils';

export const seedFoods = async (
  prisma: PrismaClient,
  data: {
    cinemas: Cinema[];
  },
  options: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { cinemas } = data;

  const foods: FoodAndBeverage[] = cinemas
    .map((cinema) => {
      if (cinema.status !== CinemaStatus.Verified) {
        return [];
      }

      const cinemaFoods: FoodAndBeverage[] = [];

      for (let i = 0; i < 4; i++) {
        cinemaFoods.push({
          id: getNextFoodAndBeverageId(),
          name: `Food ${i}`,
          description: fakerEN.lorem.paragraph(),
          price: i * 10000,
          cinemaId: cinema.id,
          quantity: fakerEN.number.int({ min: 10, max: 100 }),
          isPublished: fakerEN.datatype.boolean(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return cinemaFoods;
    })
    .flat();

  if (options.skipInsertIntoDatabase) {
    return { foods };
  }

  await prisma.foodAndBeverage.createMany({
    data: foods,
  });

  return { foods };
};
