// import { FileSizeUnit } from 'src/file/constants';
// import { ProfileOutputDto } from 'src/profile/dtos';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import path from 'path';
import { FileSizeUnit } from 'src/file/constants';
import { ProfileOutputDto } from 'src/profile/dtos';
import {
  CountOutputDto,
  MonthlyCountOutputDto,
  YearlyCountOutputDto,
} from '../dtos/count.dto';

dayjs.extend(utc);
dayjs.extend(tz);

export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null),
      );
    });
  });
}

export const requireNonNull = <T>(
  value: T | null | undefined,
  message = 'Value is null',
) => {
  if (value == null) {
    throw new Error(message);
  }
  return value;
};

export function createExceptionErrorCode(str) {
  const raw = toKebabCase(str);
  return raw.replace(/-exception$/, '');
}

export function toKebabCase(str): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function getFileExtension(name: string, full = true) {
  const parts = name.split('.').filter(Boolean);
  if (parts.length == 1) {
    return;
  }
  if (!full) {
    return path.extname(name);
  }
  return parts // removes empty extensions (e.g. `filename...txt`)
    .slice(1)
    .join('.');
}

export function getHumanReadableFileSize(size: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  while (size > 1000 && unitIndex < units.length) {
    size /= 1000;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function normalizeFileSize(size: number): {
  size: number;
  unit: FileSizeUnit;
} {
  const units = Object.values(FileSizeUnit);
  let unitIndex = 0;
  while (size > 1000 && unitIndex < units.length) {
    size /= 1000;
    unitIndex++;
  }
  return { size, unit: units[unitIndex] };
}

export const emptyObjectIfNullish = <T>(obj: T | null | undefined) =>
  obj ?? <T>{};

export const emptyArrayIfNullish = <T>(arr: T | null | undefined) =>
  arr ?? <T>[];

export const throwIfNullish = <T>(
  value: T | null | undefined,
  message = 'Value is null',
) => {
  if (value == null) {
    throw new Error(message);
  }
  return value;
};

export const parseBooleanString = (str: any) => {
  if (str === 'true') {
    return true;
  }
  if (str === 'false') {
    return false;
  }
  throw new Error('Invalid boolean string');
};

export const rootProjectPath = path.resolve('./');

export type GetProfileNameOptions = {
  short?: boolean;
};

export type GetProfileNamesOptions = GetProfileNameOptions & {
  max?: number;
};

export const getProfileNameOrNull = (
  profile?: ProfileOutputDto,
  options?: GetProfileNameOptions,
): string | undefined => {
  if (!profile) {
    return;
  }
  if (profile.lastName) {
    if (options?.short) {
      return `${profile.lastName}`;
    }
    return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`;
  }
  if (profile.username) {
    return profile.username;
  }
  return profile.email;
};

export const getProfileName = (
  profile?: ProfileOutputDto,
  options?: GetProfileNameOptions,
): string => {
  const name = getProfileNameOrNull(profile, options);
  if (!name) {
    throw new Error('Profile name is null');
  }
  return name;
};

export const getProfileNames = (
  profiles: ProfileOutputDto[],
  options?: GetProfileNamesOptions,
): string => {
  const max = options?.max;
  // If number is greater than max, then we only show the first max or 3 names plus "and x more"
  if (max != null && profiles.length > max) {
    const firstFour = profiles.slice(0, max);
    const rest = profiles.length - max;
    return `${firstFour
      .map((p) => getProfileName(p, options))
      .join(', ')} and ${rest} ${rest == 1 ? 'more' : 'others'}`;
  }
  return profiles.map((p) => getProfileName(p, options)).join(', ');
};

export const normalize = (val: number, max: number, min = 0) => {
  if (max <= min) {
    throw new Error('Max must be greater than min');
  }
  const delta = max - min;
  return (val - min) / delta;
};

export const normalizeArray = (arr: number[], max: number, min = 0) => {
  if (max <= min) {
    throw new Error('Max must be greater than min');
  }
  const delta = max - min;
  return arr.map((val) => (val - min) / delta);
};

export const secondsToHoursMinutesSeconds = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d == 1 ? ' day ' : ' days ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hour ' : ' hours ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minute ' : ' minutes ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
  return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`.trim();
};

export const executeCountGroupByTime = async (data: {
  getFirstItem: () => Promise<Date | null | undefined>;
  getLastItem: () => Promise<Date | null | undefined>;
  countTotalItems: () => Promise<number> | number;
  countItems: (from: Date, to: Date) => Promise<number> | number;
}): Promise<CountOutputDto> => {
  const first = await data.getFirstItem();
  if (first == null) {
    return { total: 0, yearly: [], monthly: [] };
  }
  const last = await data.getLastItem();
  if (last == null) {
    return { total: 0, yearly: [], monthly: [] };
  }
  const firstMonth = dayjs(first).month() + 1;
  const firstYear = dayjs(first).year();
  const lastMonth = dayjs(last).month() + 1;
  const lastYear = dayjs(last).year();

  const total = await data.countTotalItems();
  const yearly: YearlyCountOutputDto[] = [];
  const monthly: MonthlyCountOutputDto[] = [];

  const monthlyPromises: {
    year: number;
    month: number;
    count: Promise<number> | number;
  }[] = [];
  for (let year = firstYear; year <= lastYear; year++) {
    const fromMonth = year == firstYear ? firstMonth : 1;
    const toMonth = year == lastYear ? lastMonth : 12;
    for (let month = fromMonth; month <= toMonth; month++) {
      const monthCountPromise = data.countItems(
        dayjs()
          .year(year)
          .month(month - 1)
          .startOf('month')
          .toDate(),
        dayjs()
          .year(year)
          .month(month - 1)
          .endOf('month')
          .toDate(),
      );
      monthlyPromises.push({
        year: year,
        month: month,
        count: monthCountPromise,
      });
    }
  }

  await Promise.all(
    monthlyPromises.map(async (p) => {
      monthly.push({
        year: p.year,
        month: p.month,
        count: await p.count,
      });
    }),
  );

  monthly.sort((a, b) => {
    if (a.year == b.year) {
      return a.month - b.month;
    }
    return a.year - b.year;
  });

  monthly.forEach((m) => {
    const year = yearly.find((y) => y.year == m.year);
    if (year) {
      year.count += m.count;
    } else {
      yearly.push({
        year: m.year,
        count: m.count,
      });
    }
  });

  return { total, yearly, monthly };
};

export type MonthlyCountData = {
  month: Date;
  count: bigint;
};

export const countGroupByTime = async (data: MonthlyCountData[]) => {
  const yearly: YearlyCountOutputDto[] = [];
  const monthly: MonthlyCountOutputDto[] = data
    .map((r) => ({
      year: r.month.getUTCFullYear(),
      month: r.month.getUTCMonth() + 1,
      count: Number(r.count),
    }))
    .sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month;
      }
      return a.year - b.year;
    });
  monthly.forEach((m) => {
    const year = yearly.find((y) => y.year === m.year);
    if (year == null) {
      yearly.push({
        year: m.year,
        count: m.count,
      });
    } else {
      year.count += m.count;
    }
  });
  const total = yearly.reduce((a, b) => a + b.count, 0);

  const output: CountOutputDto = {
    total: total,
    monthly: monthly,
    yearly: yearly,
  };

  return output;
};
