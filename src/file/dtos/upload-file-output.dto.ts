import { Expose } from 'class-transformer';

export class UploadFileOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  internalName: string;

  @Expose()
  mimetype?: string;
}
