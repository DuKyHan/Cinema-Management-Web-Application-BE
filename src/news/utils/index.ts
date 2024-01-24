import dayjs from 'dayjs';

export const calculateNewsPopularity = (news: {
  //isPublished: boolean;
  views: number;
  publishedAt: Date;
}) => {
  // If news is not published, set popularity to MIN_SAFE_INTEGER
  // If news is published:
  // - Set popularity views if news is published no more than 7 days ago
  // - Set popularity to views - (published days - 6) * 10 if news is published more than 7 days ago
  //if (!news.isPublished) return -2147483647;
  const dateDiff = dayjs().diff(news.publishedAt, 'day');
  const popularity =
    dateDiff > 7 ? news.views - Math.pow(dateDiff - 6, 2) * 10 : news.views;
  return Math.max(popularity, -2147483647);
};
