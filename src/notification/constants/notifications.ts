import { NotificationType } from '.';

export class NotificationTemplate {
  type: NotificationType;
  title: string;
  description: string;
  shortDescription: string;
  ticketId: number | null;
  reportId: number | null;
  cinemaId: number | null;
  newsId: number | null;
  foodAndBeverageId: number | null;
}

export const cinemaApprovedNotification = (data: {
  cinemaName: string;
  cinemaId: number;
}): NotificationTemplate => {
  const { cinemaName } = data;

  return {
    type: NotificationType.Cinema,
    title: `Your cinema ${cinemaName} has been approved`,
    shortDescription: `Your cinema ${cinemaName} has been approved.`,
    description: `Your cinema ${cinemaName} has been approved.`,
    cinemaId: data.cinemaId,
    ticketId: null,
    reportId: null,
    newsId: null,
    foodAndBeverageId: null,
  };
};

export const cinemaRejectedNotification = (data: {
  cinemaName: string;
  cinemaId: number;
}): NotificationTemplate => {
  const { cinemaName, cinemaId } = data;

  return {
    type: NotificationType.Cinema,
    title: `Your cinema ${cinemaName} has been rejected`,
    shortDescription: `Your cinema ${cinemaName} has been rejected.`,
    description: `Your cinema ${cinemaName} has been rejected.`,
    cinemaId: cinemaId,
    ticketId: null,
    reportId: null,
    newsId: null,
    foodAndBeverageId: null,
  };
};

export const cinemaDisabledNotification = (data: {
  cinemaName: string;
  cinemaId: number;
}): NotificationTemplate => {
  const { cinemaName, cinemaId } = data;

  return {
    type: NotificationType.Cinema,
    title: `Your cinema ${cinemaName} has been disabled`,
    shortDescription: `Your cinema ${cinemaName} has been disabled.`,
    description: `Your cinema ${cinemaName} has been disabled.`,
    cinemaId: cinemaId,
    ticketId: null,
    reportId: null,
    newsId: null,
    foodAndBeverageId: null,
  };
};

export const cinemaEnabledNotification = (data: {
  cinemaName: string;
  cinemaId: number;
}): NotificationTemplate => {
  const { cinemaName, cinemaId } = data;

  return {
    type: NotificationType.Cinema,
    title: `Your cinema ${cinemaName} has been enabled`,
    shortDescription: `Your cinema ${cinemaName} has been enabled.`,
    description: `Your cinema ${cinemaName} has been enabled.`,
    cinemaId: cinemaId,
    ticketId: null,
    reportId: null,
    newsId: null,
    foodAndBeverageId: null,
  };
};

export const newsApprovedNotification = (data: {
  newsTitle: string;
  newsId: number;
}): NotificationTemplate => {
  const { newsTitle, newsId } = data;

  return {
    type: NotificationType.News,
    title: `Your news ${newsTitle} has been approved`,
    shortDescription: `Your news ${newsTitle} has been approved.`,
    description: `Your news ${newsTitle} has been approved.`,
    cinemaId: null,
    ticketId: null,
    reportId: null,
    newsId: newsId,
    foodAndBeverageId: null,
  };
};

export const newsRejectedNotification = (data: {
  newsTitle: string;
  newsId: number;
}): NotificationTemplate => {
  const { newsTitle, newsId } = data;

  return {
    type: NotificationType.News,
    title: `Your news ${newsTitle} has been rejected`,
    shortDescription: `Your news ${newsTitle} has been rejected.`,
    description: `Your news ${newsTitle} has been rejected.`,
    cinemaId: null,
    ticketId: null,
    reportId: null,
    newsId: newsId,
    foodAndBeverageId: null,
  };
};

export const ticketPurchaseNotification = (data: {
  ticketId: number;
  filmName: string;
}): NotificationTemplate => {
  const { ticketId, filmName } = data;

  return {
    type: NotificationType.Ticket,
    title: `You have purchased a ticket for ${filmName}`,
    shortDescription: `You have purchased a ticket for ${filmName}.`,
    description: `You have purchased a ticket for ${filmName}.`,
    cinemaId: null,
    ticketId: ticketId,
    reportId: null,
    newsId: null,
    foodAndBeverageId: null,
  };
};

export const ticketCancelNotification = (data: {
  ticketId: number;
  filmName: string;
}): NotificationTemplate => {
  const { ticketId, filmName } = data;

  return {
    type: NotificationType.Ticket,
    title: `You have canceled a ticket for ${filmName}`,
    shortDescription: `You have canceled a ticket for ${filmName}.`,
    description: `You have canceled a ticket for ${filmName}.`,
    cinemaId: null,
    ticketId: ticketId,
    reportId: null,
    newsId: null,
    foodAndBeverageId: null,
  };
};

export const reportCompletedNotification = (data: {
  reportName: string;
  reportId: number;
}): NotificationTemplate => {
  const { reportName, reportId } = data;

  return {
    type: NotificationType.Report,
    title: `Your report ${reportName} has been completed`,
    shortDescription: `Your report ${reportName} has been completed.`,
    description: `Your report ${reportName} has been completed.`,
    cinemaId: null,
    ticketId: null,
    reportId: reportId,
    newsId: null,
    foodAndBeverageId: null,
  };
};

export const reportRejectedNotification = (data: {
  reportName: string;
  reportId: number;
}): NotificationTemplate => {
  const { reportName, reportId } = data;

  return {
    type: NotificationType.Report,
    title: `Your report ${reportName} has been rejected`,
    shortDescription: `Your report ${reportName} has been rejected.`,
    description: `Your report ${reportName} has been rejected.`,
    cinemaId: null,
    ticketId: null,
    reportId: reportId,
    newsId: null,
    foodAndBeverageId: null,
  };
};

export const foodDeletedNotification = (data: {
  foodName: string;
  foodId: number;
}): NotificationTemplate => {
  const { foodName, foodId } = data;

  return {
    type: NotificationType.Food,
    title: `Your food ${foodName} has been deleted`,
    shortDescription: `Your food ${foodName} has been deleted.`,
    description: `Your food ${foodName} has been deleted.`,
    cinemaId: null,
    ticketId: null,
    reportId: null,
    newsId: null,
    foodAndBeverageId: foodId,
  };
};
