import { Transform } from 'class-transformer';
import { IsDate, IsOptional, ValidateIf } from 'class-validator';
import dayjs from 'dayjs';
import { PaginationQueryDto } from 'src/common/dtos';
import { InvalidInputException } from 'src/common/exceptions';
import { stringToDateTransform } from 'src/common/transformers';

export class AnalyticsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsDate()
  @Transform(stringToDateTransform)
  startTime?: Date;

  @IsOptional()
  @IsDate()
  @Transform(stringToDateTransform)
  @ValidateIf((o) => {
    console.log(o.startTime, o.endTime);
    console.log(dayjs(o.startTime).isBefore(o.endTime));
    if (
      o.startTime &&
      o.endTime &&
      dayjs(o.startTime).isValid() &&
      dayjs(o.endTime).isValid() &&
      dayjs(o.startTime).isAfter(o.endTime)
    ) {
      // End time must be after start time
      throw new InvalidInputException(
        'endTime',
        'End time must be after start time',
      );
    }
    return true;
  })
  endTime?: Date;
}
