export const SEAT_NAME_MAX_LENGTH = 20;

export enum RoomStatus {
  Available = 'available',
  Occupied = 'occupied',
  Unavailable = 'unavailable',
}

export const roomStatuses = Object.values(RoomStatus);
