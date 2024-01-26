import { faker } from '@faker-js/faker';
import { AppPrismaClient } from 'src/prisma';
import { seedAccountsAndRoles } from './modules/seed-account-role';
import { seedCinemaFilms } from './modules/seed-cinema-film';
import { seedCinemaPremieres } from './modules/seed-cinema-premieres';
import { seedCinemaSeats } from './modules/seed-cinema-seats';
import { seedCinemas } from './modules/seed-cinemas';
import { resetBucket } from './modules/seed-file';
import { seedFilms } from './modules/seed-films';
import { seedFoods } from './modules/seed-food';
import { seedGenres } from './modules/seed-genres';
import { seedNews } from './modules/seed-news';
import { seedNotifications } from './modules/seed-notifications';
import { seedProfiles } from './modules/seed-profile';
import { seedProfileInterests } from './modules/seed-profile-interests';
import { seedReports } from './modules/seed-reports';
import { seedRooms } from './modules/seed-room';
import { seedSeats } from './modules/seed-seats';
import { seedTickets } from './modules/seed-tickets';

faker.seed(1);

const prisma = new AppPrismaClient();

async function main() {
  console.log('🌱 Start seeding...');
  const start = Date.now();
  await prisma.connect();
  await seed();
  console.log(`✅ Seeding finished. Took ${(Date.now() - start) / 1000}s`);
}

const seed = async () => {
  const runWithoutDb = process.argv.includes('--run-without-db');
  if (runWithoutDb) console.log(`+ Run without db: ${runWithoutDb}`);
  const cleanFileStorage = process.argv.includes('--clean-file-storage');
  if (cleanFileStorage)
    console.log(`+ Clean file storage: ${cleanFileStorage}`);

  if (cleanFileStorage) {
    await resetBucket();
  }

  const {
    accounts,
    adminAccounts,
    modAccounts,
    userAccounts,
    defaultAccounts,
    nonDisabledAccounts,
    nonDisabledVolunteerAccounts,
    nonDisabledModAccounts,
  } = await runWithTimer(
    () =>
      seedAccountsAndRoles(prisma, {
        defaultAccountOptions: { include: true },
        runWithoutDb,
      }),
    '- Seeding accounts and roles...',
  );
  const defaultAccountIds = defaultAccounts.map((a) => a.id);

  const { genres } = await runWithTimer(
    () =>
      seedGenres(prisma, {
        skipInsertIntoDatabase: runWithoutDb,
      }),
    '- Seeding genres...',
  );

  const { profiles } = await runWithTimer(
    () =>
      seedProfiles(prisma, accounts, {
        importantAccountIds: defaultAccountIds,
        runWithoutDb,
      }),
    '- Seeding profiles...',
  );

  const { profileInterests } = await runWithTimer(
    () =>
      seedProfileInterests(prisma, {
        profiles: profiles,
        genres: genres,
      }),
    '- Seeding profile interests...',
  );

  const { films } = await runWithTimer(
    () =>
      seedFilms(
        prisma,
        { genres: genres },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding films...',
  );

  const { cinemas, cinemaBrands } = await runWithTimer(
    () =>
      seedCinemas(
        prisma,
        {
          defaultAccounts: defaultAccounts,
          accounts: accounts,
          modAccounts: modAccounts,
          adminAccounts: adminAccounts,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding cinemas...',
  );

  const { rooms } = await runWithTimer(
    () =>
      seedRooms(
        prisma,
        {
          cinemas: cinemas,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding rooms...',
  );

  const { seats } = await runWithTimer(
    () =>
      seedSeats(
        prisma,
        {
          rooms: rooms,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding seats...',
  );

  const { cinemaFilms } = await runWithTimer(
    () =>
      seedCinemaFilms(
        prisma,
        {
          cinemas: cinemas,
          films: films,
          rooms: rooms,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding cinema films...',
  );

  const { cinemaFilmSeats } = await runWithTimer(
    () =>
      seedCinemaSeats(
        prisma,
        {
          rooms: rooms,
          seats: seats,
          cinemaFilms: cinemaFilms,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding cinema seats...',
  );

  const { cinemaPremieres } = await runWithTimer(
    () =>
      seedCinemaPremieres(
        prisma,
        {
          cinemaFilms: cinemaFilms,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding cinema films...',
  );

  const { foods } = await runWithTimer(
    () =>
      seedFoods(
        prisma,
        {
          cinemas: cinemas,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding foods...',
  );

  const { tickets } = await runWithTimer(
    () =>
      seedTickets(
        prisma,
        {
          userAccounts: userAccounts,
          cinemaFilmSeats: cinemaFilmSeats,
          cinemaFilmPremieres: cinemaPremieres,
          foodAndBeverages: foods,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding tickets...',
  );

  // const { ticketFoods } = await runWithTimer(
  //   () =>
  //     seedTicketFoods(
  //       prisma,
  //       {
  //         tickets: tickets,
  //         foods: foods,
  //       },
  //       {
  //         skipInsertIntoDatabase: runWithoutDb,
  //       },
  //     ),
  //   '- Seeding ticket foods...',
  // );

  const { news } = await runWithTimer(
    () =>
      seedNews(
        prisma,
        {
          accounts: accounts,
          defaultAccounts: defaultAccounts,
          cinemas: cinemas,
          films: films,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding news...',
  );

  const { reports } = await runWithTimer(
    () =>
      seedReports(
        prisma,
        {
          accounts: accounts,
          adminAccounts: adminAccounts,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding reports...',
  );

  const { notifications } = await runWithTimer(
    () =>
      seedNotifications(
        prisma,
        {
          accounts: accounts,
          userAccounts: userAccounts,
          modAccounts: modAccounts,
          adminAccounts: adminAccounts,
          tickets: tickets,
          premieres: cinemaPremieres,
          cinemaFilms: cinemaFilms,
          films: films,
          reports: reports,
          cinemas: cinemas,
          cinemaBrands: cinemaBrands,
          news: news,
        },
        {
          skipInsertIntoDatabase: runWithoutDb,
        },
      ),
    '- Seeding notifications...',
  );

  if (runWithoutDb) {
    return;
  }

  // Fix sequences
  await runWithTimer(async () => {
    await prisma.$executeRaw`SELECT setval('"Account_id_seq"', (SELECT MAX(id) from "Account"));`;
    await prisma.$executeRaw`SELECT setval('"AccountBan_id_seq"', (SELECT MAX(id) from "AccountBan"));`;
    await prisma.$executeRaw`SELECT setval('"AccountVerification_id_seq"', (SELECT MAX(id) from "AccountVerification"));`;
    await prisma.$executeRaw`SELECT setval('"Role_id_seq"', (SELECT MAX(id) from "Role"));`;
    // await prisma.$executeRaw`SELECT setval('"Skill_id_seq"', (SELECT MAX(id) from "Skill"));`;
    // await prisma.$executeRaw`SELECT setval('"Organization_id_seq"', (SELECT MAX(id) from "Organization"));`;
    // await prisma.$executeRaw`SELECT setval('"Member_id_seq"', (SELECT MAX(id) from "Member"));`;
    // await prisma.$executeRaw`SELECT setval('"Activity_id_seq"', (SELECT MAX(id) from "Activity"));`;
    // await prisma.$executeRaw`SELECT setval('"Shift_id_seq"', (SELECT MAX(id) from "Shift"));`;
    // await prisma.$executeRaw`SELECT setval('"VolunteerShift_id_seq"', (SELECT MAX(id) from "VolunteerShift"));`;
    await prisma.$executeRaw`SELECT setval('"Location_id_seq"', (SELECT MAX(id) from "Location"));`;
    // await prisma.$executeRaw`SELECT setval('"Contact_id_seq"', (SELECT MAX(id) from "Contact"));`;
    await prisma.$executeRaw`SELECT setval('"File_id_seq"', (SELECT MAX(id) from "File"));`;
    // await prisma.$executeRaw`SELECT setval('"Notification_id_seq"', (SELECT MAX(id) from "Notification"));`;
    await prisma.$executeRaw`SELECT setval('"Report_id_seq"', (SELECT MAX(id) from "Report"));`;
    await prisma.$executeRaw`SELECT setval('"ReportMessage_id_seq"', (SELECT MAX(id) from "ReportMessage"));`;
    await prisma.$executeRaw`SELECT setval('"Chat_id_seq"', (SELECT MAX(id) from "Chat"));`;
    await prisma.$executeRaw`SELECT setval('"ChatParticipant_id_seq"', (SELECT MAX(id) from "ChatParticipant"));`;
    await prisma.$executeRaw`SELECT setval('"ChatMessage_id_seq"', (SELECT MAX(id) from "ChatMessage"));`;
    await prisma.$executeRaw`SELECT setval('"News_id_seq"', (SELECT MAX(id) from "News"));`;
    await prisma.$executeRaw`SELECT setval('"Film_id_seq"', (SELECT MAX(id) from "Film"));`;
    await prisma.$executeRaw`SELECT setval('"Cinema_id_seq"', (SELECT MAX(id) from "Cinema"));`;
    await prisma.$executeRaw`SELECT setval('"Room_roomId_seq"', (SELECT MAX("roomId") from "Room"));`;
    await prisma.$executeRaw`SELECT setval('"Seat_seatId_seq"', (SELECT MAX("seatId") from "Seat"));`;
    await prisma.$executeRaw`SELECT setval('"CinemaFilm_id_seq"', (SELECT MAX(id) from "CinemaFilm"));`;
    await prisma.$executeRaw`SELECT setval('"CinemaFilmPremiere_id_seq"', (SELECT MAX(id) from "CinemaFilmPremiere"));`;
    await prisma.$executeRaw`SELECT setval('"FoodAndBeverage_id_seq"', (SELECT MAX(id) from "FoodAndBeverage"));`;
    await prisma.$executeRaw`SELECT setval('"Ticket_id_seq"', (SELECT MAX(id) from "Ticket"));`;
    await prisma.$executeRaw`SELECT setval('"Notification_id_seq"', (SELECT MAX(id) from "Notification"));`;
  }, 'Fixing sequences...');
};

const runWithTimer = async <T>(
  fn: () => Promise<T>,
  startMessage: string,
): Promise<T> => {
  const start = Date.now();
  console.log(startMessage);
  const res: T = await fn();
  console.log(` |_ ✓ Completed in ${(Date.now() - start) / 1000}s`);
  return res;
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
