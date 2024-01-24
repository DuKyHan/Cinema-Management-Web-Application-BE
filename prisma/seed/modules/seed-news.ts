import { faker, fakerEN } from '@faker-js/faker';
import { Account, Cinema, Film, News, PrismaClient } from '@prisma/client';
import csv from 'csv-parse/sync';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { requireNonNull } from 'src/common/utils';
import {
  NewsContentFormat,
  NewsStatus,
  NewsType,
  newsStatuses,
  newsTypes,
} from 'src/news/constants';
import { calculateNewsPopularity } from 'src/news/utils';
import { getNextNewsId } from '../utils';
import { seedFiles } from './seed-file';

const rejectionReasons = [
  'Content is not appropriate',
  'Content is not relevant',
  'Community guidelines violation',
  'Spam',
];

export const seedNews = async (
  prisma: PrismaClient,
  data: {
    accounts: Account[];
    defaultAccounts: Account[];
    cinemas: Cinema[];
    films: Film[];
  },
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  const news: News[] = [];
  const newsHasThumbnail: boolean[] = [];
  const newsTemplates = loadNews(
    path.join(__dirname, '..', `/assets/news.csv`),
  );

  const cinemaIds = data.cinemas.map((cinema) => cinema.id);
  const filmIds = data.films.map((film) => film.id);

  data.accounts
    .filter((user) => user.isEmailVerified === true)
    .forEach((user) => {
      let numberOfNews: number = 20;
      const isDefault = data.defaultAccounts.some(
        (defaultUser) => defaultUser.id === user.id,
      );
      if (!isDefault) {
        numberOfNews = faker.helpers.weightedArrayElement([
          {
            weight: 20,
            value: 0,
          },
          {
            weight: 10,
            value: 1,
          },
          {
            weight: 5,
            value: 2,
          },
          {
            weight: 1,
            value: 3,
          },
        ]);

        for (let i = 0; i < numberOfNews; i++) {
          news.push(
            generateNews({
              authorId: user.id,
              cinemaIds: cinemaIds,
              filmIds: filmIds,
              template: fakerEN.helpers.arrayElement(newsTemplates),
            }),
          );
        }

        return;
      }
    });

  news.forEach((news) => {
    const isDefault = data.defaultAccounts.some(
      (defaultAccount) => defaultAccount.id === news.authorId,
    );
    if (isDefault) {
      newsHasThumbnail.push(faker.datatype.boolean());
      return;
    }
    newsHasThumbnail.push(
      faker.helpers.weightedArrayElement([
        { weight: 3, value: true },
        { weight: 1, value: false },
      ]),
    );
  });

  const newsThumbnails = await seedFiles(
    prisma,
    './tmp/images/news-thumbnail',
    {
      downloadOption: {
        url: faker.image.urlLoremFlickr({
          width: 1280,
          height: 720,
          category: 'cinema',
        }),
      },
      count: newsHasThumbnail.filter((hasThumbnail) => hasThumbnail).length,
    },
    {
      skipInsertIntoDatabase: options?.skipInsertIntoDatabase,
    },
  );

  news.forEach((news, index) => {
    if (!newsHasThumbnail[index]) {
      return;
    }
    news.thumbnail = requireNonNull(newsThumbnails.shift()).id;
  });

  const returnData = { news };

  if (options?.skipInsertIntoDatabase) {
    return returnData;
  }

  await prisma.news.createMany({
    data: news,
  });

  return returnData;
};

const generateNews = (data: {
  authorId: number;
  filmIds: number[];
  cinemaIds: number[];
  template: NewsTemplate;
}): News => {
  const type = faker.helpers.arrayElement(newsTypes);
  const filmId = type === NewsType.Film ? _.sample(data.filmIds) : null;
  const cinemaId = type === NewsType.Cinema ? _.sample(data.cinemaIds) : null;
  const isPublished = faker.datatype.boolean();
  const createdAt = faker.date.past();
  const views = isPublished ? faker.number.int({ min: 0, max: 300 }) : 0;
  const publishedAt = createdAt;
  const closedAt = faker.date.future({
    refDate: publishedAt,
  });
  const status = faker.helpers.arrayElement(newsStatuses);

  return {
    id: getNextNewsId(),
    type: type,
    title: data.template?.title ?? faker.lorem.lines(1),
    content:
      data.template?.description ??
      faker.lorem.paragraphs({
        min: 3,
        max: 10,
      }),
    contentFormat: NewsContentFormat.Plaintext,
    thumbnail: null,
    views: views,
    popularity: calculateNewsPopularity({
      //isPublished: isPublished,
      publishedAt: publishedAt,
      views: views,
    }),
    authorId: data.authorId,
    status: status,
    rejectionReason:
      status === NewsStatus.Rejected
        ? fakerEN.helpers.arrayElement(rejectionReasons)
        : null,
    publishedAt: publishedAt,
    createdAt: createdAt,
    updatedAt: faker.date.between({
      from: createdAt,
      to: new Date(),
    }),
    filmId: filmId ?? null,
    cinemaId: cinemaId ?? null,
    closedAt: closedAt,
  };
};

class NewsTemplate {
  title: string;
  description: string;
}

const loadNews = (path: string) => {
  // Parse txt file
  // Return array of NewsTemplate
  const newsTemplates: NewsTemplate[] = [];
  const content = fs.readFileSync(path, {
    encoding: 'utf8',
  });
  const records: any[] = csv.parse(content, {
    bom: true,
    skipEmptyLines: true,
    from_line: 2,
  });
  records.forEach((record) => {
    const newsTemplate: NewsTemplate = {
      title: record[0],
      description: record[1],
    };
    newsTemplates.push(newsTemplate);
  });
  return newsTemplates;
};
