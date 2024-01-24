import { faker } from '@faker-js/faker';
import { Actor, Film, FilmGenre, Genre } from '@prisma/client';
import csv from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { ageRestricted } from 'src/film/constants';
import { AppPrismaClient } from 'src/prisma';
import { getNextActorId, getNextFilmId, getNextGenreId } from '../utils';
import { seedFiles } from './seed-file';

enum EGenre {
  Action = 'action',
  Adventure = 'adventure',
  Animation = 'animation',
  Comedy = 'comedy',
  Crime = 'crime',
  Documentary = 'documentary',
  Drama = 'drama',
  Family = 'family',
  Fantasy = 'fantasy',
  History = 'history',
  Horror = 'horror',
  Music = 'music',
  Mystery = 'mystery',
  Romance = 'romance',
  ScienceFiction = 'science-fiction',
  TvMovie = 'tv-movie',
  Thriller = 'thriller',
  War = 'war',
}

const trailers = [
  'https://www.youtube.com/embed/NmzuHjWmXOc',
  'https://www.youtube.com/embed/UaVTIH8mujA',
  'https://www.youtube.com/embed/EXeTwQWrcwY',
  'https://www.youtube.com/embed/9O1Iy9od7-A',
];

export const seedFilms = async (
  prisma: AppPrismaClient,
  options: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const genres = await createFilmGenre();
  const { films, filmGenres, filmActors } = await readFilms(
    prisma,
    { genres: genres },
    options,
  );
  if (options?.skipInsertIntoDatabase) {
    return { films };
  }
  await prisma.genre.createMany({
    data: genres,
  });
  await prisma.film.createMany({
    data: films,
  });
  await prisma.filmGenre.createMany({
    data: filmGenres,
  });
  await prisma.actor.createMany({
    data: filmActors,
  });
  return { films };
};

const createFilmGenre = async () => {
  const genres: Genre[] = Object.values(EGenre).map((genre) => ({
    id: getNextGenreId(),
    name: genre,
  }));
  return genres;
};

const mapGenreNameToId = (
  genres: Genre[],
  genreName: string,
): number | null => {
  const genre = genres.find((genre) => genre.name === genreName.toLowerCase());
  if (!genre) {
    return null;
  }
  return genre.id;
};

const readFilms = async (
  prisma: AppPrismaClient,
  data: {
    genres: Genre[];
  },
  options: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const content = fs.readFileSync(
    path.join(__dirname, `../assets/imdb_top_1000.csv`),
    {
      encoding: 'utf8',
    },
  );
  const records: any[] = csv.parse(content, {
    bom: true,
    skipEmptyLines: true,
    from_line: 2,
    to_line: 20,
  });

  const filmActors: Actor[] = [];
  const filmGenres: FilmGenre[] = [];
  const thumbnailUrls: string[] = [];
  const films: Film[] = records.map((record, index) => {
    const film: Film = {
      id: getNextFilmId(),
      name: record[1],
      Duration: parseInt(record[4].split(' ')[0]),
      description: record[7],
      AgeRestricted:
        ageRestricted.find((ageRestricted) => ageRestricted === record[3]) ??
        faker.helpers.arrayElement(ageRestricted),
      TrailerLink: trailers[index],
      thumbnailId: null,
    };

    const thumbnailUrl = record[0];
    const thumbnailParts = thumbnailUrl.split('@');
    const modifiedThumbnailUrl = thumbnailParts[0] + '@._V1_SX600.jpg';
    thumbnailUrls.push(modifiedThumbnailUrl);

    const genreNames: number[] = record[5]
      .split(', ')
      .map((genreName) => mapGenreNameToId(data.genres, genreName))
      .filter((genreId) => genreId !== null) as number[];
    filmGenres.push(
      ...genreNames.map((genreId) => ({
        filmId: film.id,
        genreId,
      })),
    );

    for (let i = 10; i < 14; i++) {
      const actorName = record[i];
      filmActors.push({
        id: getNextActorId(),
        name: actorName,
        filmId: film.id,
      });
    }

    return film;
  });

  const thumbnails = await seedFiles(
    prisma,
    './tmp/images/movie-posters',
    films.map((film, index) => ({
      downloadOption: {
        url: thumbnailUrls[index],
        fileName: `${film.id}.jpg`,
      },
      filePathToCheckIfExist: `./${film.id}.jpg`,
    })),
    {
      skipInsertIntoDatabase: options?.skipInsertIntoDatabase,
    },
  );

  for (let i = 0; i < films.length; i++) {
    films[i].thumbnailId = thumbnails[i]?.id ?? null;
  }

  if (options.skipInsertIntoDatabase) {
    return { films, filmGenres, filmActors };
  }

  return { films, filmGenres, filmActors };
};
