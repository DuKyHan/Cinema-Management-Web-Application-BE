import { Injectable } from '@nestjs/common';
import { FoodAndBeverage, Prisma, Ticket } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { EmailService } from 'src/email/services';
import { FoodOutStockException } from 'src/foods/exceptions';
import { PrismaService } from 'src/prisma';
import { CreateTicketDto, TicketQueryDto, TicketSort } from '../dtos';
import { TicketOutputDto } from '../dtos/ticket.output.dto';
import { SeatNotAvailableException } from '../exceptions';

@Injectable()
export class TicketService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    super(logger);
  }

  async getTickets(context: RequestContext, query: TicketQueryDto) {
    this.logCaller(context, this.getTickets);
    if (context.isAdmin) {
      const res = await this.prisma.ticket.findMany({
        where: this.getWhere(context, query),
        take: query.limit,
        skip: query.offset,
        orderBy: {
          updatedAt: 'desc',
        },
        include: this.getInclude(),
      });
      return res.map((item) => this.mapToDto(item));
    }
    const res = await this.prisma.ticket.findMany({
      where: this.getWhere(context, query),
      take: query.limit,
      skip: query.offset,
      orderBy: this.getOrderBy(query),
      include: this.getInclude(),
    });
    return res.map((item) => this.mapToDto(item));
  }

  async getTicketById(context: RequestContext, id: number) {
    this.logCaller(context, this.getTicketById);
    const res = await this.prisma.ticket.findUnique({
      where: {
        id: id,
      },
      include: this.getInclude(),
    });
    if (res == null) {
      return null;
    }
    return this.mapToDto(res);
  }

  getWhere(context: RequestContext, query: TicketQueryDto) {
    const where: Prisma.TicketWhereInput = {};
    if (!context.isAdmin) {
      where.accountId = context.account.id;
    } else {
      if (query.accountId) {
        where.accountId = query.accountId;
      }
    }
    if (query.search) {
      where.OR = [
        {
          CinemaFilmPremiere: {
            CinemaFilm: {
              Film: {
                name: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        {
          CinemaFilmPremiere: {
            CinemaFilm: {
              Cinema: {
                name: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        // Room
        {
          Seat: {
            room: {
              name: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }
    if (query.startPremiereDate || query.endPremiereDate) {
      where.CinemaFilmPremiere = {
        premiere: {
          gte: query.startPremiereDate,
          lte: query.endPremiereDate,
        },
      };
    }
    return where;
  }

  getInclude() {
    const include: Prisma.TicketInclude = {
      Seat: {
        include: {
          room: true,
        },
      },
      CinemaFilmPremiere: {
        include: {
          CinemaFilm: {
            include: {
              Cinema: true,
              Film: true,
            },
          },
        },
      },
    };
    return include;
  }

  getOrderBy(query: TicketQueryDto) {
    const orderBy: Prisma.TicketOrderByWithRelationAndSearchRelevanceInput = {};
    if (query.sort === TicketSort.PremiereDateAsc) {
      orderBy.CinemaFilmPremiere = {
        premiere: 'asc',
      };
    } else if (query.sort === TicketSort.PremiereDateDesc) {
      orderBy.CinemaFilmPremiere = {
        premiere: 'desc',
      };
    } else if (query.sort === TicketSort.CreatedAtAsc) {
      orderBy.createdAt = 'asc';
    } else if (query.sort === TicketSort.CreatedAtDesc) {
      orderBy.createdAt = 'desc';
    }
    return orderBy;
  }

  async createTicket(context: RequestContext, dto: CreateTicketDto) {
    this.logCaller(context, this.createTicket);

    return this.prisma.$transaction(
      async (tx) => {
        // Check if seat is available
        const oneStepBeforeYou = await tx.ticket.findFirst({
          where: {
            premiereId: dto.premiereId,
            seatId: dto.seatId,
          },
        });
        if (oneStepBeforeYou != null) {
          throw new SeatNotAvailableException();
        }

        const cinemaSeat = await tx.cinemaFilmSeat.findFirst({
          where: {
            seatId: dto.seatId,
          },
        });
        if (cinemaSeat == null) {
          throw new SeatNotAvailableException();
        }

        let foodBeveragesPrice = 0;
        let foodBeverages: FoodAndBeverage[] = [];
        let ticket: Ticket;
        if (dto.foodBeverages != null && dto.foodBeverages.length > 0) {
          foodBeverages = await tx.foodAndBeverage.findMany({
            where: {
              id: { in: dto.foodBeverages.map((item) => item.id) },
            },
          });
          foodBeveragesPrice = foodBeverages.reduce(
            (acc, item) =>
              acc +
              dto.foodBeverages!.find((i) => i.id === item.id)!.quantity *
                item.price,
            0,
          );
          // Check if all food quantity still available
          const foodBeveragesMap = new Map<number, number>();
          foodBeverages.forEach((item) => {
            foodBeveragesMap.set(item.id, item.quantity);
          });
          dto.foodBeverages.forEach((item) => {
            const quantity = foodBeveragesMap.get(item.id);
            if (quantity == null || quantity < item.quantity) {
              throw new FoodOutStockException();
            }
            foodBeveragesMap.set(item.id, quantity - item.quantity);
          });

          ticket = await tx.ticket.create({
            data: {
              premiereId: dto.premiereId,
              accountId: context.account.id,
              price: cinemaSeat.price + foodBeveragesPrice,
              seatId: dto.seatId,
            },
            include: this.getInclude(),
          });

          const ticketFoodBeverages = await tx.ticketFoodAndBeverage.createMany(
            {
              data: dto.foodBeverages.map((item) => ({
                ticketId: ticket.id,
                foodAndBeverageId: item.id,
                quantity: item.quantity,
              })),
            },
          );
          // Update food and beverage quantity
          for (const [id, quantity] of foodBeveragesMap.entries()) {
            await tx.foodAndBeverage.update({
              where: {
                id: id,
              },
              data: {
                quantity: quantity,
              },
            });
          }
        } else {
          ticket = await tx.ticket.create({
            data: {
              premiereId: dto.premiereId,
              accountId: context.account.id,
              price: cinemaSeat.price + foodBeveragesPrice,
              seatId: dto.seatId,
            },
            include: this.getInclude(),
          });
        }

        const ticketOutput = this.mapToDto(ticket);

        this.emailService.sendTicketEmail(context, context.account.email, {
          ticketId: ticket.id,
          film: ticketOutput.film!.name,
          cinema: ticketOutput.cinema!.name,
          room: ticketOutput.room!.name,
          seat: ticketOutput.seat!.name,
          foodAndBeverages: foodBeverages.map((item) => ({
            name: item.name,
            quantity: dto.foodBeverages!.find((i) => i.id === item.id)!
              .quantity,
            price:
              item.price *
              dto.foodBeverages!.find((i) => i.id === item.id)!.quantity,
          })),
          totalPrice: ticket.price,
        });

        if (dto.foodBeverages == null || dto.foodBeverages.length === 0) {
          return ticket;
        }

        return ticket;
      },
      { timeout: 15000 },
    );
  }

  async deleteTicket(context: RequestContext, id: number) {
    this.logCaller(context, this.deleteTicket);
    return this.prisma.ticket.delete({
      where: {
        id: id,
      },
    });
  }

  mapToDto(data: any): TicketOutputDto {
    const res = this.output(TicketOutputDto, {
      ...data,
      cinema: data.CinemaFilmPremiere?.CinemaFilm?.Cinema,
      film: data.CinemaFilmPremiere?.CinemaFilm?.Film,
      premiere: data.CinemaFilmPremiere?.premiere,
      seat: data.Seat,
      room: data.Seat?.room,
    });
    return res;
  }
}
