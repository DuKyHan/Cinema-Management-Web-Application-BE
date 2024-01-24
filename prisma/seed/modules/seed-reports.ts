import { fakerEN } from '@faker-js/faker';
import { Account, PrismaClient, Report, ReportMessage } from '@prisma/client';
import { ReportStatus, ReportType, reportStatuses } from 'src/report/constants';
import { getNextReportId, getNextReportMessageId } from '../utils';

export const seedReports = async (
  prisma: PrismaClient,
  data: {
    accounts: Account[];
    adminAccounts: Account[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const { accounts } = data;

  const reports: Report[] = [];
  const reportMessages: ReportMessage[] = [];

  accounts.forEach((account) => {
    const ticketReport = generateTicketReport({
      account,
      adminAccounts: data.adminAccounts,
    });
    reports.push(ticketReport.report);
    reportMessages.push(...ticketReport.messages);

    const bugReport = generateBugReport({
      account,
      adminAccounts: data.adminAccounts,
    });
    reports.push(bugReport.report);
    reportMessages.push(...bugReport.messages);
  });

  if (options?.skipInsertIntoDatabase) {
    return { reports, reportMessages };
  }

  await prisma.report.createMany({
    data: reports,
  });

  await prisma.reportMessage.createMany({
    data: reportMessages,
  });

  return { reports, reportMessages };
};

const ticketReportTitles = [
  {
    title: 'I want to cancel my ticket',
    content:
      'I want to cancel my ticket. I keep getting an error. Please help me.',
    adminContent: 'Can you send me your ticket code?',
  },
  {
    title: 'I want to change my ticket',
    content:
      'I want to change my ticket. I want to change the date. Do I have to pay extra?',
    adminContent: 'You can change your ticket for free.',
  },
  {
    title: 'I want to refund my ticket',
    content:
      'I want to refund my ticket. I can not go to the cinema. Now I want to refund my ticket.',
    adminContent: 'Try to cancel your ticket using the app.',
  },
  {
    title: 'I can not purchase ticket',
    content: 'I can not purchase ticket. The part of payment is not working.',
    adminContent: 'Can you send me a screenshot?',
  },
];

const generateTicketReport = (data: {
  account: Account;
  adminAccounts: Account[];
}) => {
  const { account, adminAccounts } = data;

  const titleContent = fakerEN.helpers.arrayElement(ticketReportTitles);

  const status = fakerEN.helpers.arrayElement(reportStatuses);
  const admin =
    status === ReportStatus.Pending || status === ReportStatus.Cancelled
      ? null
      : fakerEN.helpers.arrayElement(adminAccounts);

  const report: Report = {
    id: getNextReportId(),
    reporterId: account.id,
    reviewerId: admin?.id ?? null,
    reviewerMessage: admin ? titleContent.adminContent : null,
    type: ReportType.Ticket,
    title: titleContent.title,
    status: status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const messages: ReportMessage[] = [];

  messages.push({
    id: getNextReportMessageId(),
    reportId: report.id,
    senderId: account.id,
    content: titleContent.content,
    first: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  // if (admin) {
  //   messages.push({
  //     id: getNextReportMessageId(),
  //     reportId: report.id,
  //     senderId: admin.id,
  //     content: titleContent.adminContent,
  //     first: false,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   });
  // }

  return { report, messages };
};

const bugReportTitles = [
  {
    title: 'I found a bug',
    content: 'I found a bug in the system. Please fix it.',
    contentAdmin:
      'Thank you for your report. We will fix it as soon as possible.',
  },
  {
    title: 'I found a security issue',
    content:
      'I found a security issue. I can access other users data. Please fix it.',
    contentAdmin: 'Let me check it. Thank you for your report.',
  },
  {
    title: 'I found a problem',
    content: 'I found a problem. I cannot login to the system. Please fix it.',
    contentAdmin: 'Have you tried to reset your password?',
  },
];

const generateBugReport = (data: {
  account: Account;
  adminAccounts: Account[];
}): { report: Report; messages: ReportMessage[] } => {
  const { account, adminAccounts } = data;

  const titleContent = fakerEN.helpers.arrayElement(bugReportTitles);
  const status = fakerEN.helpers.arrayElement(reportStatuses);
  const admin =
    status === ReportStatus.Pending || status === ReportStatus.Cancelled
      ? null
      : fakerEN.helpers.arrayElement(adminAccounts);

  const report: Report = {
    id: getNextReportId(),
    reporterId: account.id,
    reviewerId: admin?.id ?? null,
    reviewerMessage: admin ? titleContent.contentAdmin : null,
    type: ReportType.General,
    title: titleContent.title,
    status: status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const messages: ReportMessage[] = [];

  messages.push({
    id: getNextReportMessageId(),
    reportId: report.id,
    senderId: account.id,
    content: titleContent.content,
    first: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // if (admin) {
  //   messages.push({
  //     id: getNextReportMessageId(),
  //     reportId: report.id,
  //     senderId: admin.id,
  //     content: titleContent.contentAdmin,
  //     first: false,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   });
  // }

  return { report, messages };
};
