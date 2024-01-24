import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { FileTooLargeException } from '../exceptions';

export class UploadFilePipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    // 200MB file size limit
    if (value.size > 1000 * 1000 * 200) {
      throw new FileTooLargeException(value.size, '200MB');
    }
    return value;
  }
}
