import { BaseApiException } from "src/common/exceptions";


export class InvalidCoordinateException extends BaseApiException {
  constructor() {
    super({ message: 'Invalid coordinate' });
  }
}
