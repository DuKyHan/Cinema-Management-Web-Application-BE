import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import dayjs from 'dayjs';

@ValidatorConstraint({ name: 'IsOnTheSameDay', async: true })
@Injectable()
export class IsOnTheSameDayValidator implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [ref] = args.constraints;
    const startTime = args.object[ref];
    if (startTime == null) {
      throw new Error(`Cannot find property ${ref} in object`);
    }
    return dayjs(value).isSame(dayjs(startTime), 'day');
  }

  defaultMessage(args: ValidationArguments) {
    const [ref] = args.constraints;
    return `${args.property} must be on the same day as ${ref}`;
  }
}

export interface IsOnTheSameDayOptions extends ValidationOptions {
  ref: string;
}

export function IsOnTheSameDay(validationOptions?: IsOnTheSameDayOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [validationOptions?.ref],
      validator: IsOnTheSameDayValidator,
    });
  };
}
