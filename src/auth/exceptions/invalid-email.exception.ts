import { BaseApiException } from "src/common/exceptions";


export class InvalidEmailException extends BaseApiException {
  constructor() {
    super({ message: 'The email address is badly formatted' });
  }
}
