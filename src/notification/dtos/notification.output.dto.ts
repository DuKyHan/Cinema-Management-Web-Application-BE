import { Expose } from 'class-transformer';
import { ReportOutputDto } from 'src/report/dtos';
import { NotificationType } from '../constants';

export class NotificationOutputDto {
  @Expose()
  id: number;

  @Expose()
  accountId: number;

  @Expose()
  from?: string;

  @Expose()
  type: NotificationType;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  shortDescription?: string;

  @Expose()
  read: boolean;

  @Expose()
  pushOnly: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  reportId?: number;

  @Expose()
  report?: ReportOutputDto;

  // Metadata fields

  @Expose()
  _count?: number;
}
