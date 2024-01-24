
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CinemaNotFoundException } from '../exceptions';
import { PrismaService } from 'src/prisma';

@Injectable()
export class CinemaValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  transform(id: number, metadata: ArgumentMetadata) {
    const cinema = this.prisma.cinema.findUnique({
      where: { id },
    });
    if (!cinema) {
      throw new CinemaNotFoundException();
    }
    return id;
  }
}
