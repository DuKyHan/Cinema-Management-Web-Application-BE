import { Genre, PrismaClient } from '@prisma/client';
import { getNextGenreId } from '../utils';

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

const createFilmGenre = async () => {
  const genres: Genre[] = Object.values(EGenre).map((genre) => ({
    id: getNextGenreId(),
    name: genre,
  }));
  return genres;
};

export const seedGenres = async (
  prisma: PrismaClient,
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const genres = await createFilmGenre();
  if (options?.skipInsertIntoDatabase) {
    return { genres };
  }
  await prisma.genre.createMany({
    data: genres,
  });
  return { genres };
};
