import { fakerEN } from '@faker-js/faker';
import {
  Account,
  Cinema,
  CinemaBrand,
  CinemaFilm,
  CinemaFilmPremiere,
  Film,
  News,
  Notification,
  PrismaClient,
  Report,
  Ticket,
} from '@prisma/client';
import { CinemaStatus } from 'src/cinema/constants';
import { NewsStatus } from 'src/news/constants';
import { NotificationType } from 'src/notification/constants';
import {
  cinemaApprovedNotification,
  cinemaRejectedNotification,
  newsApprovedNotification,
  newsRejectedNotification,
  ticketCancelNotification,
  ticketPurchaseNotification,
} from 'src/notification/constants/notifications';
import { TicketStatus } from 'src/ticket/constants';
import { getNextNotificationId } from '../utils';

export const seedNotifications = async (
  prisma: PrismaClient,
  data: {
    accounts: Account[];
    userAccounts: Account[];
    modAccounts: Account[];
    adminAccounts: Account[];
    tickets: Ticket[];
    premieres: CinemaFilmPremiere[];
    cinemaFilms: CinemaFilm[];
    films: Film[];
    reports: Report[];
    cinemas: Cinema[];
    cinemaBrands: CinemaBrand[];
    news: News[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const {
    accounts,
    userAccounts,
    modAccounts,
    adminAccounts,
    tickets,
    premieres,
    cinemaFilms,
    films,
    reports,
    cinemas,
    cinemaBrands,
    news,
  } = data;

  const notifications: Notification[] = [];

  accounts.forEach((account) => {
    notifications.push({
      id: getNextNotificationId(),
      accountId: account.id,
      type: NotificationType.System,
      from: 'System',
      title: 'Welcome to Cinema Web!',
      shortDescription: 'Welcome to Cinema Web!',
      description: 'Welcome to Cinema Web!',
      read: fakerEN.datatype.boolean(),
      pushOnly: false,
      reportId: null,
      ticketId: null,
      newsId: null,
      cinemaId: null,
      foodAndBeverageId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  userAccounts.forEach((account) => {
    notifications.push({
      id: getNextNotificationId(),
      accountId: account.id,
      type: NotificationType.System,
      from: 'System',
      title: 'Welcome to Cinema Web!',
      shortDescription: 'Welcome to Cinema Web!',
      description: 'Welcome to Cinema Web!',
      read: fakerEN.datatype.boolean(),
      pushOnly: false,
      reportId: null,
      ticketId: null,
      newsId: null,
      cinemaId: null,
      foodAndBeverageId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    generateTicketNotifications(
      account,
      tickets,
      premieres,
      cinemaFilms,
      films,
    ).forEach((n) => notifications.push(n));
  });

  modAccounts.forEach((account) => {
    generateCinemaNotifications(account, cinemas, cinemaBrands).forEach((n) =>
      notifications.push(n),
    );
    generateNewsNotifications(account, news).forEach((n) =>
      notifications.push(n),
    );
  });

  if (options?.skipInsertIntoDatabase) {
    return { notifications };
  }

  await prisma.notification.createMany({
    data: notifications,
  });

  return { notifications };
};

export const generateCinemaNotifications = (
  account: Account,
  cinemas: Cinema[],
  cinemaBrands: CinemaBrand[],
): Notification[] => {
  const accountBrands = cinemaBrands.filter((cb) => cb.ownerId === account.id);
  if (accountBrands.length === 0) {
    return [];
  }
  const accountCinemas = cinemas.filter((c) =>
    accountBrands.some((cb) => cb.id === c.cinemaBrandId),
  );
  if (accountCinemas.length === 0) {
    return [];
  }
  const notifications: Notification[] = [];

  const approveCinemas = accountCinemas.filter(
    (c) => c.status === CinemaStatus.Verified,
  );
  const rejectCinemas = accountCinemas.filter(
    (c) => c.status === CinemaStatus.Rejected,
  );
  if (approveCinemas.length > 0) {
    const cinema = fakerEN.helpers.arrayElement(approveCinemas);
    notifications.push({
      id: getNextNotificationId(),
      accountId: account.id,
      from: 'System',
      read: fakerEN.datatype.boolean(),
      pushOnly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...cinemaApprovedNotification({
        cinemaName: cinema.name,
        cinemaId: cinema.id,
      }),
    });
  }
  if (rejectCinemas.length > 0) {
    const cinema = fakerEN.helpers.arrayElement(rejectCinemas);
    notifications.push({
      id: getNextNotificationId(),
      accountId: account.id,
      from: 'System',
      read: fakerEN.datatype.boolean(),
      pushOnly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...cinemaRejectedNotification({
        cinemaName: cinema.name,
        cinemaId: cinema.id,
      }),
    });
  }
  return notifications;
};

export const generateNewsNotifications = (
  account: Account,
  news: News[],
): Notification[] => {
  const accountNews = news.filter((n) => n.authorId === account.id);
  if (accountNews.length === 0) {
    return [];
  }
  const notifications: Notification[] = [];
  const approvedNews = accountNews.filter(
    (n) => n.status === NewsStatus.Published,
  );
  const rejectedNews = accountNews.filter(
    (n) => n.status === NewsStatus.Rejected,
  );
  if (approvedNews.length > 0) {
    const news = fakerEN.helpers.arrayElement(approvedNews);
    notifications.push({
      id: getNextNotificationId(),
      accountId: account.id,
      from: 'System',
      read: fakerEN.datatype.boolean(),
      pushOnly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...newsApprovedNotification({
        newsTitle: news.title,
        newsId: news.id,
      }),
    });
  }
  if (rejectedNews.length > 0) {
    const news = fakerEN.helpers.arrayElement(rejectedNews);
    notifications.push({
      id: getNextNotificationId(),
      accountId: account.id,
      from: 'System',
      read: fakerEN.datatype.boolean(),
      pushOnly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...newsRejectedNotification({
        newsId: news.id,
        newsTitle: news.title,
      }),
    });
  }
  return notifications;
};

export const generateTicketNotifications = (
  account: Account,
  tickets: Ticket[],
  premieres: CinemaFilmPremiere[],
  cinemaFilms: CinemaFilm[],
  films: Film[],
): Notification[] => {
  const accountTickets = tickets.filter((t) => t.accountId === account.id);
  if (accountTickets.length === 0) {
    return [];
  }
  const notifications: Notification[] = [];
  const paidTickets = accountTickets.filter(
    (t) => t.status === TicketStatus.Paid,
  );
  const cancelledTickets = accountTickets.filter(
    (t) => t.status === TicketStatus.Cancelled,
  );
  if (paidTickets.length > 0) {
    const ticket = fakerEN.helpers.arrayElement(paidTickets);
    const premiere = premieres.find((p) => p.id === ticket.premiereId)!;
    const cinemaFilm = cinemaFilms.find(
      (cf) => cf.id == premiere.cinemaFilmId,
    )!;
    const film = films.find((f) => f.id === cinemaFilm.filmId)!;
    notifications.push({
      id: getNextNotificationId(),
      accountId: account.id,
      from: 'System',
      read: fakerEN.datatype.boolean(),
      pushOnly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...ticketPurchaseNotification({
        ticketId: ticket.id,
        filmName: film.name,
      }),
    });
  }
  if (cancelledTickets.length > 0) {
    const ticket = fakerEN.helpers.arrayElement(cancelledTickets);
    const premiere = premieres.find((p) => p.id === ticket.premiereId)!;
    const cinemaFilm = cinemaFilms.find(
      (cf) => cf.id == premiere.cinemaFilmId,
    )!;
    const film = films.find((f) => f.id === cinemaFilm.filmId)!;
    notifications.push({
      id: getNextNotificationId(),
      accountId: account.id,
      from: 'System',
      read: fakerEN.datatype.boolean(),
      pushOnly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...ticketCancelNotification({
        ticketId: ticket.id,
        filmName: film.name,
      }),
    });
  }
  return notifications;
};
