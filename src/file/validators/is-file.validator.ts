import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { PrismaService } from '../../prisma';

@ValidatorConstraint({ name: 'IsFileId', async: true })
@Injectable()
export class IsFileIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    return (await this.prisma.file.count({ where: { id: value } })) == 1;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid file`;
  }
}

export function IsFileId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsFileIdValidator,
    });
  };
}
