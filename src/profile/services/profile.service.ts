import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AccountNotFoundException } from 'src/auth/exceptions';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { LocationOutputDto } from 'src/location/dtos';
import { LocationService } from 'src/location/services';
import { PrismaService } from '../../prisma';
import {
  GetProfileInclude,
  GetProfileQueryDto,
  GetProfileSelect,
  GetProfilesQueryDto,
  ProfileOutputDto,
  UpdateProfileInputDto,
  ViewedGenreTimes,
} from '../dtos';

@Injectable()
export class ProfileService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
  ) {
    super(logger);
    this.logger.setContext(ProfileService.name);
  }

  async getProfiles(
    ctx: RequestContext | null | undefined,
    query: GetProfilesQueryDto,
  ): Promise<ProfileOutputDto[]> {
    this.logCaller(ctx, this.getProfiles);
    const where = this.getProfileWhere(query);
    const profiles: any[] = await this.prisma.profile.findMany({
      where: where,
      select: this.parseProfileSelect(query.select, query.includes),
      take: query.limit,
      skip: query.offset,
    });
    return this.outputArray(ProfileOutputDto, profiles);
  }

  getProfileWhere(query: GetProfilesQueryDto) {
    const where: Prisma.ProfileWhereInput = {};

    if (query.ids || query.excludeId) {
      where.id = {
        in: query.ids,
        notIn: query.excludeId,
      };
    }

    if (query.search) {
      where.OR = [
        {
          username: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          firstName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  async getProfile(
    ctx: RequestContext | null | undefined,
    accountId: number,
    query?: GetProfileQueryDto,
  ): Promise<ProfileOutputDto | null> {
    this.logger.log(ctx, `${this.getProfile.name} was called`);
    this.logger.log(ctx, `calling prisma.profile findOneBy`);

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return null;
    }

    const profile: any | null = await this.prisma.profile.findUnique({
      where: { id: accountId },
      select: this.parseProfileSelect(query?.select, query?.includes),
    });

    if (!profile) {
      this.logger.log(ctx, `account profile does not exist, create one`);
      this.logger.log(ctx, `calling prisma.profile create`);
      const profile = await this.prisma.profile.create({
        data: {
          id: accountId,
        },
      });
      return this.output(ProfileOutputDto, {
        ...profile,
        email: account.email,
      });
    }
    const viewedGenreTimes: ViewedGenreTimes[] = [];
    if (query?.includes?.includes(GetProfileInclude.VIEWED_GENRE_TIMES)) {
      const tickets = await this.prisma.ticket.findMany({
        where: {
          accountId: accountId,
        },
        select: {
          CinemaFilmPremiere: {
            select: {
              CinemaFilm: {
                select: {
                  Film: {
                    select: {
                      Duration: true,
                      FilmGenre: {
                        select: {
                          Genre: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      console.log(JSON.stringify(tickets, null, 2));
      tickets.forEach((t) => {
        const film = t.CinemaFilmPremiere.CinemaFilm.Film;
        const duration = film.Duration;
        film.FilmGenre.forEach((fg) => {
          const genre = fg.Genre;
          const index = viewedGenreTimes.findIndex(
            (vgt) => vgt.genre.id === genre.id,
          );
          if (index === -1) {
            viewedGenreTimes.push({
              genre: genre,
              duration: duration,
            });
          } else {
            viewedGenreTimes[index].duration += duration;
          }
        });
      });
    }
    const res = {
      ...profile,
      id: profile.accountId,
      email: account.email,
      interestedGenres: profile.InterestedGenres?.map((g) => g.genre),
      viewedGenreTimes: viewedGenreTimes,
    };
    return this.output(ProfileOutputDto, res);
  }

  /**
   * Create or update the account profile
   * @param ctx request context
   * @param input profile input dto
   * @returns
   */
  async updateProfile(
    ctx: RequestContext,
    input: UpdateProfileInputDto,
  ): Promise<ProfileOutputDto> {
    this.logger.log(ctx, `${this.updateProfile.name} was called`);
    const accountId = ctx.account.id;

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new AccountNotFoundException();
    }

    this.logger.log(ctx, `calling prisma.profile findOneBy`);
    const profile = await this.prisma.profile.findUnique({
      where: { id: accountId },
    });

    let location: LocationOutputDto | undefined = undefined;
    if (input.location != null) {
      if (profile == null || profile.locationId == null) {
        location = await this.locationService.create(ctx, input.location);
      } else {
        location = await this.locationService.update(
          ctx,
          profile.locationId,
          input.location,
        );
      }
    }

    const updatedProfile: any = {
      ...input,
      avatar: input.avatarId,
      location: undefined,
    };

    this.logger.log(ctx, `calling prisma.profile save`);
    let res: any;
    if (profile == null) {
      await this.prisma.$transaction(async (tx) => {
        res = await tx.profile.create({
          data: {
            id: accountId,
            username: input.username,
            firstName: input.firstName,
            lastName: input.lastName,
            phoneNumber: input.phoneNumber,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender,
            bio: input.bio,
            avatarId: input.avatarId,
          },
          include: {
            location: true,
          },
        });
        if (input.interestedGenres) {
          await tx.interestedGenres.createMany({
            data: input.interestedGenres.map((g) => ({
              genreId: g,
              profileId: accountId,
            })),
          });
        }
      });
    } else {
      await this.prisma.$transaction(async (tx) => {
        res = await tx.profile.update({
          where: { id: accountId },
          data: {
            username: input.username,
            firstName: input.firstName,
            lastName: input.lastName,
            phoneNumber: input.phoneNumber,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender,
            bio: input.bio,
            avatarId: input.avatarId,
          },
          include: {
            location: true,
          },
        });
        if (input.interestedGenres) {
          await tx.interestedGenres.deleteMany({
            where: {
              profileId: accountId,
            },
          });
          await tx.interestedGenres.createMany({
            data: input.interestedGenres.map((g) => ({
              genreId: g,
              profileId: accountId,
            })),
          });
        }
      });
    }

    return this.output(ProfileOutputDto, res);
  }

  parseProfileSelect(
    select?: GetProfileSelect[],
    includes?: GetProfileInclude[],
  ) {
    const defaultSelect = select == null || select?.length === 0;

    const res: Prisma.ProfileSelect = {
      username: select?.includes(GetProfileSelect.Username) || defaultSelect,
      firstName: select?.includes(GetProfileSelect.FullName) || defaultSelect,
      lastName: select?.includes(GetProfileSelect.FullName) || defaultSelect,
      phoneNumber:
        select?.includes(GetProfileSelect.PhoneNumber) || defaultSelect,
      dateOfBirth:
        select?.includes(GetProfileSelect.DateOfBirth) || defaultSelect,
      gender: select?.includes(GetProfileSelect.Gender) || defaultSelect,
      bio: select?.includes(GetProfileSelect.Bio) || defaultSelect,
      avatarId: select?.includes(GetProfileSelect.Avatar) || defaultSelect,
      location: select?.includes(GetProfileSelect.Location) || defaultSelect,
      account:
        select?.includes(GetProfileSelect.Email) ||
        (defaultSelect && {
          select: {
            email: true,
          },
        }),
      id: true,
      InterestedGenres: includes?.includes(GetProfileInclude.INTERESTED_GENRES)
        ? { include: { genre: true } }
        : false,
    };
    return res;
  }
}
