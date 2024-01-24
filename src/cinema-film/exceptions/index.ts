import { BaseApiException } from 'src/common/exceptions';

export class CinemaFilmNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Cinema film not found', status: 404 });
  }
}
