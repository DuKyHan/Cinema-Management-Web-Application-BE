import { BaseApiException } from "src/common/exceptions";


export class AccountNotFoundException extends BaseApiException {
  constructor() {
    super({
      message: 'There is no user record corresponding to this identifier',
      status: 404,
    });
  }
}
