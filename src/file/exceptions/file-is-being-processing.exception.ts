import { BaseApiException } from "src/common/exceptions";


export class FileProcessingHasNotFinished extends BaseApiException {
  constructor() {
    super({ message: 'File is being processed' });
  }
}
