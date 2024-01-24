import { BaseApiException } from "src/common/exceptions";


export class FileNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'File not found', status: 404 });
  }
}
