import { BaseApiException } from "src/common/exceptions";


export class CanNotUploadFileException extends BaseApiException {
  constructor(err: any) {
    super({
      message: 'Can not upload file to server',
      status: 500,
      details: err,
    });
  }
}
