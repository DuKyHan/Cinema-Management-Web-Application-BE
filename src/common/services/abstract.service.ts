import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from 'class-transformer';

import { BaseApiResponse } from '../dtos';
import { AppLogger } from '../logger';
import { RequestContext } from '../request-context';

export abstract class AbstractService {
  private readonly name;

  constructor(protected readonly logger: AppLogger) {
    this.name = this.constructor.name;
    logger.setContext(this.name);
  }

  protected outputArray<T, V>(
    cls: ClassConstructor<T>,
    plain: V[],
    options?: ClassTransformOptions,
  ): T[] {
    return plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
      ...options,
    });
  }

  protected extendedOutputArray<T, V>(
    cls: ClassConstructor<T>,
    plain: V[],
    meta: Record<string, unknown>,
    options?: ClassTransformOptions,
  ): BaseApiResponse<T[]> {
    const data = plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
      ...options,
    });
    const res = new BaseApiResponse<T[]>();
    res.data = data;
    res.meta = meta;
    return res;
  }

  protected output<T, V>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions,
  ): T {
    return plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
      ...options,
    });
  }

  protected extendedOutput<T, V>(
    cls: ClassConstructor<T>,
    plain: V,
    meta: Record<string, unknown>,
    options?: ClassTransformOptions,
  ): BaseApiResponse<T> {
    const data = plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
      ...options,
    });
    const res = new BaseApiResponse<T>();
    res.data = data;
    res.meta = meta;
    return res;
  }

  protected logCaller(
    ctx: RequestContext | null | undefined,
    // eslint-disable-next-line @typescript-eslint/ban-types
    func: Function | string,
  ) {
    const funcName = typeof func === 'string' ? func : func.name;
    this.logger.log(ctx, `${this.name}.${funcName} was called`);
  }

  protected logCallee<T>(
    ctx: RequestContext,
    cls: ClassConstructor<T> | string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    func: Function | string,
  ) {
    const clsName = typeof cls === 'string' ? cls : cls.name;
    const funcName = typeof func === 'string' ? func : func.name;
    this.logger.log(ctx, `calling ${clsName}.${funcName}`);
  }
}
