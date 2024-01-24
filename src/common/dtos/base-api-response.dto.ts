/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BaseApiResponse<T> {
  public data: T; // Swagger Decorator is added in the extended class below, since that will override this one.

  @ApiProperty({ type: Object })
  public meta?: any = {};
}

export function SwaggerBaseApiResponse<
  T extends
    | Type<unknown>
    | Function
    | [Function]
    | string
    | Record<string, any>,
>(type: T): typeof BaseApiResponse {
  class ExtendedBaseApiResponse<T> extends BaseApiResponse<T> {
    @ApiProperty({ type: type })
    public declare data: T;
  }
  // NOTE : Overwrite the returned class name, otherwise whichever type calls this function in the last,
  // will overwrite all previous definitions. i.e., Swagger will have all response types as the same one.
  const isAnArray = Array.isArray(type) ? ' [ ] ' : '';
  Object.defineProperty(ExtendedBaseApiResponse, 'name', {
    value: `SwaggerBaseApiResponseFor ${type} ${isAnArray}`,
  });

  return ExtendedBaseApiResponse;
}

export class ErrorObject {
  @Expose()
  @ApiProperty({ type: Number })
  public statusCode: number;

  @Expose()
  @ApiProperty({ type: String })
  public message: string;

  @Expose()
  @ApiPropertyOptional({ type: String })
  public localizedMessage: string;

  @Expose()
  @ApiProperty({ type: String })
  public errorName: string;

  @Expose()
  @ApiProperty({ type: Object })
  public details: unknown;
}

export class BaseApiErrorObject extends ErrorObject {
  @ApiProperty({ type: String })
  public path: string;

  @ApiProperty({ type: String })
  public requestId: string;

  @ApiProperty({ type: String })
  public timestamp: string;
}

export class BaseApiErrorResponse {
  @ApiProperty({ type: BaseApiErrorObject })
  public error: BaseApiErrorObject;
}
