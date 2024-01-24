import { BaseApiException } from 'src/common/exceptions';

export class RoomNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Room not found', status: 404 });
  }
}

export class RoomHasSameNameException extends BaseApiException {
  constructor() {
    super({ message: 'Room has same name' });
  }
}
