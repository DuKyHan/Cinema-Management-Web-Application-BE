import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { InvalidInputException } from 'src/common/exceptions';
import { PrismaService } from 'src/prisma';
import { NewsType } from '../constants';
import { CreateNewsInputDto } from '../dtos';

export const validateValidNewsType = (
  object: CreateNewsInputDto,
  value: NewsType,
): boolean => {
  if (object.filmId != null && object.cinemaId != null) {
    throw new InvalidInputException(
      'filmId',
      'filmId and cinemaId cannot be set at the same time',
    );
  }
  if (value === NewsType.Film && object.filmId == null) {
    throw new InvalidInputException(
      'filmId',
      'filmId is required when news type is film',
    );
  }
  if (value === NewsType.Cinema && object.cinemaId == null) {
    throw new InvalidInputException(
      'cinemaId',
      'cinemaId is required when news type is cinema',
    );
  }
  return true;
};

@ValidatorConstraint({ name: 'IsOrganizationMember', async: true })
@Injectable()
export class IsOrganizationMemberValidator
  implements ValidatorConstraintInterface
{
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
      validator: IsOrganizationMemberValidator,
    });
  };
}
