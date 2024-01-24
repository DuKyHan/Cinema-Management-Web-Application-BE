import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class MarkNotificationsAsReadInputDto {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  id: number[];
}
