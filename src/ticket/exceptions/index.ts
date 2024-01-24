import { BaseApiException } from 'src/common/exceptions';

export class SeatNotAvailableException extends BaseApiException {
  constructor() {
    super({ message: 'Seat is not available' });
  }
}
