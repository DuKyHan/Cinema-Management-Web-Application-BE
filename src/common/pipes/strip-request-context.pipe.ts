import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  transform(value: any) {
    if (value.context) {
      const { context, ...rest } = value;
      return rest;
    }
    return value;
  }
}
