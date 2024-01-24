import { BaseApiException } from 'src/common/exceptions';

export class CinemaBrandNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Cinema brand not found', status: 404 });
  }
}

export class AccountAlreadyHasACinemaBrandException extends BaseApiException {
  constructor() {
    super({ message: 'Account already has a cinema brand' });
  }
}

export class AccountHaveNotHadCinemaBrandException extends BaseApiException {
  constructor() {
    super({ message: 'Account have not had a cinema brand' });
  }
}
