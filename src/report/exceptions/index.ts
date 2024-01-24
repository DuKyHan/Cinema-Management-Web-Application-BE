import { BaseApiException } from 'src/common/exceptions';

export class ReportNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Report not found', status: 404 });
  }
}

export class ReportAccountMustNotBeNullException extends BaseApiException {
  constructor() {
    super({ message: 'Report account must not be null' });
  }
}

export class ReportOrganizationMustNotBeNullException extends BaseApiException {
  constructor() {
    super({ message: 'Report organization must not be null' });
  }
}

export class ReportActivityMustNotBeNullException extends BaseApiException {
  constructor() {
    super({ message: 'Report activity must not be null' });
  }
}

export class ReportCanNotBeCancelledException extends BaseApiException {
  constructor() {
    super({ message: 'Report can not be cancelled' });
  }
}

export class ReportIsNotInReviewingException extends BaseApiException {
  constructor() {
    super({ message: 'Report is not in reviewing' });
  }
}

export class ReportIsInReviewingException extends BaseApiException {
  constructor() {
    super({ message: 'Report is in reviewing' });
  }
}

export class ReportIsNotPendingException extends BaseApiException {
  constructor() {
    super({ message: 'Report is not pending' });
  }
}
