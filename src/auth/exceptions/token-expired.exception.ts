import { BaseApiException } from "src/common/exceptions";


export class LoginSessionExpiredException extends BaseApiException {
  constructor() {
    super({
      message: 'Your login session has expired. Please re-login again',
      errorCode: 'login-session-expired',
      status: 401,
    });
  }
}
