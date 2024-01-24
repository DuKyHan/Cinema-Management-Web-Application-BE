import { BaseApiException } from 'src/common/exceptions';

export class SeatNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Seat not found', status: 404 });
  }
}

export class SeatIsFullException extends BaseApiException {
  constructor() {
    super({ message: 'Seat is full' });
  }
}

export class SeatAtPositionAlreadyExistsException extends BaseApiException {
  constructor() {
    super({ message: 'Seat at position already exists' });
  }
}
