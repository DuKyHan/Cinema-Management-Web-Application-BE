export const EMAIL_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 20000;

export enum CinemaStatus {
  Pending = 'pending',
  Cancelled = 'cancelled',
  Verified = 'verified',
  Rejected = 'rejected',
}

export const cinemaStatuses = Object.values(CinemaStatus);
