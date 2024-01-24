export enum ReportType {
  General = 'general',
  Ticket = 'ticket',
}

export const reportTypes = Object.values(ReportType);

export enum ReportStatus {
  Pending = 'pending',
  Cancelled = 'cancelled',
  //Reviewing = 'reviewing',
  Completed = 'completed',
  Rejected = 'rejected',
}

export const reportStatuses = Object.values(ReportStatus);
