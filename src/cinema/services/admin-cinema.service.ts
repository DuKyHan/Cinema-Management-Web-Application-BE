import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import {
  cinemaApprovedNotification,
  cinemaDisabledNotification,
  cinemaEnabledNotification,
  cinemaRejectedNotification,
} from 'src/notification/constants/notifications';
import { NotificationService } from 'src/notification/services';
import { PrismaService } from 'src/prisma';
import { CinemaStatus } from '../constants';
import { ChangeCinemaStatusDto } from '../dtos';
import {
  CinemaNotFoundException,
  InvalidCinemaStatusException,
} from '../exceptions';

@Injectable()
export class AdminCinemaService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    super(logger);
  }

  async verifyCinema(
    context: RequestContext,
    id: number,
    dto: ChangeCinemaStatusDto,
  ) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id },
      include: { cinemaBrand: true },
    });

    if (cinema == null) {
      throw new CinemaNotFoundException();
    }

    if (
      cinema.status !== CinemaStatus.Pending &&
      cinema.status !== CinemaStatus.Rejected
    ) {
      throw new InvalidCinemaStatusException();
    }

    const res = await this.prisma.cinema.update({
      where: { id },
      data: {
        status: CinemaStatus.Verified,
        verifierId: context.account.id,
        verifierComment: dto.comment ?? null,
      },
    });

    this.notificationService.sendNotification(
      context,
      cinema.cinemaBrand.ownerId,
      {
        ...cinemaApprovedNotification({
          cinemaName: res.name,
          cinemaId: res.id,
        }),
      },
    );

    return res;
  }

  async rejectCinema(
    context: RequestContext,
    id: number,
    dto: ChangeCinemaStatusDto,
  ) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id },
      include: { cinemaBrand: true },
    });

    if (cinema == null) {
      throw new CinemaNotFoundException();
    }

    if (
      cinema.status !== CinemaStatus.Pending &&
      cinema.status !== CinemaStatus.Verified
    ) {
      throw new InvalidCinemaStatusException();
    }

    const res = await this.prisma.cinema.update({
      where: { id },
      data: {
        status: CinemaStatus.Rejected,
        verifierId: context.account.id,
        verifierComment: dto.comment ?? null,
      },
    });

    this.notificationService.sendNotification(
      context,
      cinema.cinemaBrand.ownerId,
      {
        ...cinemaRejectedNotification({
          cinemaName: res.name,
          cinemaId: res.id,
        }),
      },
    );

    return res;
  }

  async disableCinema(
    context: RequestContext,
    id: number,
    dto: ChangeCinemaStatusDto,
  ) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id },
      include: { cinemaBrand: true },
    });

    if (cinema == null) {
      throw new CinemaNotFoundException();
    }

    if (cinema.status !== CinemaStatus.Verified) {
      throw new InvalidCinemaStatusException();
    }

    const res = await this.prisma.cinema.update({
      where: { id },
      data: { isDisabled: true, disabledComment: dto.comment ?? null },
    });

    this.notificationService.sendNotification(
      context,
      cinema.cinemaBrand.ownerId,
      {
        ...cinemaDisabledNotification({
          cinemaName: res.name,
          cinemaId: res.id,
        }),
      },
    );

    return res;
  }

  async enableCinema(
    context: RequestContext,
    id: number,
    dto: ChangeCinemaStatusDto,
  ) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id },
      include: { cinemaBrand: true },
    });

    if (cinema == null) {
      throw new CinemaNotFoundException();
    }

    if (cinema.status !== CinemaStatus.Verified) {
      throw new InvalidCinemaStatusException();
    }

    const res = await this.prisma.cinema.update({
      where: { id },
      data: { isDisabled: false, disabledComment: dto.comment ?? null },
    });

    this.notificationService.sendNotification(
      context,
      cinema.cinemaBrand.ownerId,
      {
        ...cinemaEnabledNotification({
          cinemaName: res.name,
          cinemaId: res.id,
        }),
      },
    );

    return res;
  }
}
