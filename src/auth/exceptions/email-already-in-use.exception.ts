import { BaseApiException } from "src/common/exceptions";


export class EmailAlreadyInUseException extends BaseApiException {
  constructor() {
    super({
      message: 'The email address is already in use by another account',
    });
  }
}
