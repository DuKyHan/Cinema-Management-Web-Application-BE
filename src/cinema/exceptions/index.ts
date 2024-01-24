import { BaseApiException } from 'src/common/exceptions';

export class CinemaNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Cinema not found', status: 404 });
  }
}

export class InvalidCinemaStatusException extends BaseApiException {
  constructor() {
    super({ message: 'Invalid cinema status' });
  }
}
