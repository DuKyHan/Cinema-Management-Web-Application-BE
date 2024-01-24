import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseApiResponse } from 'src/common/dtos';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import {
  CreateFilmDto,
  FilmPremiereQueryDto,
  FilmQueryDto,
  UpdateFilmDto,
} from '../dtos';

@Injectable()
export class FilmService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getFilms(query: FilmQueryDto) {
    const films = await this.prisma.film.findMany({
      where: this.getWhere(query),
      include: {
        FilmGenre: {
          include: {
            Genre: true,
          },
        },
        Actor: true,
      },
      take: query.limit,
      skip: query.offset,
    });

    const total = await this.prisma.film.count({
      where: this.getWhere(query),
    });

    const response = new BaseApiResponse();
    response.data = films.map((film) => ({
      ...film,
      genres: film.FilmGenre.map((fg) => fg.Genre.id),
      genreNames: film.FilmGenre.map((fg) => fg.Genre.name),
      actors: film.Actor.map((a) => a.name),
    }));
    response.meta = {
      total: total,
      count: films.length,
    };

    return response;
  }

  private getWhere(query: FilmQueryDto) {
    if (!query.search) {
      return {};
    }
    return {
      name: {
        contains: query.search,
        mode: Prisma.QueryMode.insensitive,
      },
    };
  }

  async getFilmById(id: number) {
    const film = await this.prisma.film.findUnique({
      where: {
        id,
      },
      include: {
        FilmGenre: {
          include: {
            Genre: true,
          },
        },
        Actor: true,
      },
    });

    if (!film) {
      return null;
    }

    return {
      ...film,
      genres: film.FilmGenre.map((fg) => fg.Genre.id),
      genreNames: film.FilmGenre.map((fg) => fg.Genre.name),
      actors: film.Actor.map((a) => a.name),
    };
  }

  async getFilmPremieres(query: FilmPremiereQueryDto) {
    const whereSearch = query.search
      ? Prisma.sql`WHERE "name" ILIKE ${`%${query.search}%`}`
      : Prisma.empty;
    const conditions: Prisma.Sql[] = [];
    if (query.startDate) {
      conditions.push(Prisma.sql`"premiere" >= ${query.startDate}`);
    }
    if (query.endDate) {
      conditions.push(Prisma.sql`"premiere" <= ${query.endDate}`);
    }
    if (query.ownerId) {
      conditions.push(Prisma.sql`"ownerId" = ${query.ownerId}`);
    }
    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
        : Prisma.empty;
    const res = await this.prisma.$queryRaw`
      SELECT *
      FROM "Film"
      JOIN (
        SELECT "filmId", array_agg("premiere"::timestamptz ORDER BY "premiere") as "premieres", min("premiere") as "firstPremiere"
        FROM "CinemaFilmPremiere" 
        JOIN "CinemaFilm" ON "CinemaFilm"."id" = "CinemaFilmPremiere"."cinemaFilmId" 
        JOIN "Cinema" ON "Cinema"."id" = "CinemaFilm"."cinemaId"
        JOIN "CinemaBrand" ON "CinemaBrand"."id" = "Cinema"."cinemaBrandId"
        ${where}
        GROUP BY "filmId"
      ) AS cf
      ON "Film"."id" = "filmId"
      ${whereSearch}
      ORDER BY "firstPremiere" ASC
      LIMIT ${Prisma.sql`${query.limit}`} OFFSET ${Prisma.sql`${query.offset}`}
      `;
    return res;
  }

  async getFilmPremieresById(id: number, query: FilmPremiereQueryDto) {
    const premiereConditions: Prisma.Sql[] = [];
    premiereConditions.push(Prisma.sql`"filmId" = ${id}`);
    if (query.startDate) {
      premiereConditions.push(Prisma.sql`"premiere" >= ${query.startDate}`);
    }
    if (query.endDate) {
      premiereConditions.push(Prisma.sql`"premiere" <= ${query.endDate}`);
    }
    const wherePremiere =
      premiereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(premiereConditions, ` AND `)}`
        : Prisma.empty;
    const res: object[] = await this.prisma.$queryRaw`
      SELECT * 
      FROM "Film" 
      JOIN (
        SELECT "filmId", json_agg(json_build_object('cinemaId', "cinemaId", 'cinemaFilmId', "cinemaFilmId", 'premiere', "premiere"::timestamptz, 'id', "CinemaFilmPremiere"."id") ORDER BY "premiere") as "premieres", min("premiere") as "firstPremiere"
        FROM "CinemaFilmPremiere" 
        JOIN "CinemaFilm" 
        ON "CinemaFilm"."id" = "CinemaFilmPremiere"."cinemaFilmId" 
        ${wherePremiere}
        GROUP BY "filmId"
      ) AS cf 
      ON "Film"."id" = "filmId"
      `;
    if (res.length === 0) {
      return null;
    }
    const premiere = res[0];
    const actors = await this.prisma.actor.findMany({
      where: {
        filmId: id,
      },
    });
    const genres = await this.prisma.filmGenre.findMany({
      where: {
        filmId: id,
      },
      include: {
        Genre: true,
      },
    });
    const cinemaIds = new Set<number>(
      premiere['premieres'].map((p) => p.cinemaId),
    );
    const cinemas = await this.prisma.cinema.findMany({
      where: {
        id: {
          in: Array.from(cinemaIds),
        },
      },
      include: {
        location: true,
      },
    });
    return {
      ...premiere,

      actors: actors.map((a) => a.name),
      genres: genres.map((g) => g.genreId),
      genreNames: genres.map((g) => g.Genre.name),
      cinemas: cinemas,
    };
  }

  async createFilm(dto: CreateFilmDto) {
    return this.prisma.$transaction(async (tx) => {
      const film = await tx.film.create({
        data: {
          ...{ ...dto, genres: undefined, actors: undefined },
        },
      });

      if (dto.actors) {
        await tx.actor.createMany({
          data: dto.actors.map((actor) => ({
            name: actor,
            filmId: film.id,
          })),
        });
      }

      if (dto.genres) {
        await tx.filmGenre.createMany({
          data: dto.genres.map((genre) => ({
            genreId: genre,
            filmId: film.id,
          })),
        });
      }

      return film;
    });
  }

  async updateFilm(id: number, dto: UpdateFilmDto) {
    return this.prisma.$transaction(
      async (tx) => {
        if (dto.actors) {
          await tx.actor.deleteMany({
            where: {
              filmId: id,
            },
          });
          await tx.actor.createMany({
            data: dto.actors.map((actor) => ({
              name: actor,
              filmId: id,
            })),
          });
        }

        if (dto.genres) {
          await tx.filmGenre.deleteMany({
            where: {
              filmId: id,
            },
          });
          await tx.filmGenre.createMany({
            data: dto.genres.map((genre) => ({
              genreId: genre,
              filmId: id,
            })),
          });
        }
        return tx.film.update({
          where: {
            id,
          },
          data: {
            ...{ ...dto, genres: undefined, actors: undefined },
          },
        });
      },
      {
        timeout: 15000,
      },
    );
  }

  async deleteFilm(id: number) {
    return this.prisma.film.delete({
      where: {
        id,
      },
    });
  }
}
