import { Expose } from 'class-transformer';

export class FileOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  internalName: string;

  @Expose()
  mimetype?: string;

  @Expose()
  size: number;

  @Expose()
  sizeUnit: string;

  @Expose()
  createdBy?: number;
}
