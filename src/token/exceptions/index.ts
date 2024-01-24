import { BaseApiException } from "src/common/exceptions";


export class EarlyTokenRenewalException extends BaseApiException {
  constructor() {
    super({ message: 'Token renewal request is too early' });
  }
}

export class InvalidTokenException extends BaseApiException {
  constructor() {
    super({ message: 'The token is invalid or has been expired' });
  }
}
