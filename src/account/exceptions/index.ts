import { BaseApiException } from 'src/common/exceptions';

export class UnableToBanSelfAccountException extends BaseApiException {
  constructor() {
    super({ message: 'Unable to ban your own account' });
  }
}

export class UnableToBanAdminAccountException extends BaseApiException {
  constructor() {
    super({ message: 'Unable to ban admin account' });
  }
}
