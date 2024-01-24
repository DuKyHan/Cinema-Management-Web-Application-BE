// import { ActivityOutputDto } from 'src/activity/dtos';
// import { OrganizationOutputDto } from 'src/organization/dtos';
import { Expose } from 'class-transformer';
import { ProfileOutputDto } from 'src/profile/dtos';
import { NewsContentFormat, NewsStatus, NewsType } from '../constants';

export class NewsOutputDto {
  @Expose()
  id: number;

  @Expose()
  type: NewsType;

  @Expose()
  organizationId: number;

  // @Expose()
  // organization?: OrganizationOutputDto;

  @Expose()
  authorId: number;

  @Expose()
  author?: ProfileOutputDto;

  @Expose()
  thumbnail: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  contentFormat: NewsContentFormat;

  @Expose()
  views: number;

  @Expose()
  popularity: number;

  // @Expose()
  // isPublished: boolean;

  @Expose()
  status: NewsStatus;

  @Expose()
  rejectionReason: string;

  @Expose()
  activityId?: number;

  // @Expose()
  // activity?: ActivityOutputDto;

  @Expose()
  publishedAt: Date;

  @Expose()
  updatedAt: Date;
}
