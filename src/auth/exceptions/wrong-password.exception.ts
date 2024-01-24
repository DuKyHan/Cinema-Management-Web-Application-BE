import { BaseApiException } from "src/common/exceptions";


export class WrongPasswordException extends BaseApiException {
  constructor() {
    super({ message: 'Wrong account password' });
  }
}
