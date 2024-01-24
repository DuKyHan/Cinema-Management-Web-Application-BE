import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import csv from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

let accountId = 1;
let organizationId = 1;
let locationId = 1;
let contactId = 1;
let memberId = 1;
let activityId = 1;
let shiftId = 1;
let shiftVolunteerId = 1;
let fileId = 1;
let accountVerificationId = 1;
let accountBanId = 1;
let skillId = 1;
let roleId = 1;
let notificationId = 1;
let reportId = 1;
let reportMessageId = 1;
let chatId = 1;
let chatParticipantId = 1;
let chatMessageId = 1;
let newsId = 1;
let filmId = 1;
let cinemaId = 1;
let cinemaBrandId = 1;
let genreId = 1;
let roomId = 1;
let seatId = 1;
let cinemaFilm = 1;
let foodAndBeverageId = 1;
let ticketId = 1;
let cinemaFilmPremiereId = 1;
let actorId = 1;

export const getNextAccountId = () => accountId++;
export const getNextOrganizationId = () => organizationId++;
export const getNextLocationId = () => locationId++;
export const getNextContactId = () => contactId++;
export const getNextMemberId = () => memberId++;
export const getNextActivityId = () => activityId++;
export const getNextShiftId = () => shiftId++;
export const getNextShiftVolunteerId = () => shiftVolunteerId++;
export const getNextFileId = () => fileId++;
export const getNextAccountVerificationId = () => accountVerificationId++;
export const getNextAccountBanId = () => accountBanId++;
export const getNextSkillId = () => skillId++;
export const getNextRoleId = () => roleId++;
export const getNextNotificationId = () => notificationId++;
export const getNextReportId = () => reportId++;
export const getNextReportMessageId = () => reportMessageId++;
export const getNextChatId = () => chatId++;
export const getNextChatParticipantId = () => chatParticipantId++;
export const getNextChatMessageId = () => chatMessageId++;
export const getNextNewsId = () => newsId++;
export const getNextFilmId = () => filmId++;
export const getNextCinemaId = () => cinemaId++;
export const getNextCinemaBrandId = () => cinemaBrandId++;
export const getNextGenreId = () => genreId++;
export const getNextRoomId = () => roomId++;
export const getNextSeatId = () => seatId++;
export const getNextCinemaFilmId = () => cinemaFilm++;
export const getNextFoodAndBeverageId = () => foodAndBeverageId++;
export const getNextTicketId = () => ticketId++;
export const getNextCinemaFilmPremiereId = () => cinemaFilmPremiereId++;
export const getNextActorId = () => actorId++;

export enum SkillType {
  Health = 'Health',
  Food = 'Food',
  Education = 'Education',
  Equality = 'Equality',
  Climate = 'Climate',
  Conservation = 'Conservation',
  Job = 'Job',
}

export const skillTypes = Object.values(SkillType);

export const requireNonNullish = <T>(
  value: T | null | undefined,
  message = 'Value is null',
) => {
  if (value == null) {
    throw new Error(message);
  }
  return value;
};

export const randomDate = () => {
  return fakerVi.date.between('2018-01-01', new Date());
};

export const generateViName = (
  genderName: 'male' | 'female',
): { firstName: string; lastName: string } => {
  let firstName = fakerVi.person.lastName(genderName);
  let lastName = fakerVi.person.firstName(genderName);

  const parts = lastName.split(' ');
  if (parts.length > 1) {
    firstName += ' ' + parts[0];
  }
  lastName = parts[parts.length - 1];

  return {
    firstName,
    lastName,
  };
};

export const generateLocation = (options?: {
  region?: string;
}): ExtendedLocation => {
  const location =
    options?.region == null
      ? fakerVi.helpers.weightedArrayElement(getWeightedLocations())
      : fakerVi.helpers.weightedArrayElement(
          getWeightedLocationsGroupedByRegion(options.region),
        );

  return {
    id: getNextLocationId(),
    addressLine1: fakerVi.location.streetAddress(false),
    addressLine2: fakerVi.location.secondaryAddress(),
    locality: location.locality,
    region: location.region,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const locationToAddress = (location: ExtendedLocation) => {
  let s = '';
  if (location.addressLine1) {
    s += location.addressLine1;
  }
  if (location.addressLine2) {
    if (s.length > 0) {
      s += ', ';
    }
    s += location.addressLine2;
  }
  if (location.locality) {
    if (s.length > 0) {
      s += ', ';
    }
    s += location.locality;
  }
  if (location.region) {
    if (s.length > 0) {
      s += ', ';
    }
    s += location.region;
  }
  if (location.country) {
    if (s.length > 0) {
      s += ', ';
    }
    s += location.country;
  }
};

// export const generateEnLocation = () => ({
//   id: getNextLocationId(),
//   addressLine1: fakerEn.location.streetAddress(false),
//   addressLine2: fakerEn.location.secondaryAddress(),
//   locality: fakerEn.location.city(),
//   region: fakerEn.location.state(),
//   country: 'US',
//   latitude: fakerEn.location.latitude(),
//   longitude: fakerEn.location.longitude(),
//   createdAt: new Date(),
//   updatedAt: new Date(),
// });
const memberRejectionReasonTemplate = [
  'Member has bad reputation',
  'Member is not active enough',
  'Does not meet the requirements',
  'Not enough experience',
];
// export const generateMember = (
//   account: Account,
//   organization: Organization,
// ): Member => {
//   const status =
//     _.sample(Object.values(OrganizationMemberStatus)) ??
//     OrganizationMemberStatus.Pending;
//   const censorId = [
//     OrganizationMemberStatus.Approved,
//     OrganizationMemberStatus.Rejected,
//     OrganizationMemberStatus.Removed,
//   ].includes(status)
//     ? organization.ownerId
//     : null;
//   const rejectionReason = [
//     OrganizationMemberStatus.Rejected,
//     OrganizationMemberStatus.Removed,
//   ].includes(status)
//     ? fakerEn.helpers.arrayElement(memberRejectionReasonTemplate)
//     : null;

//   return {
//     id: getNextMemberId(),
//     organizationId: organization.id,
//     accountId: account.id,
//     status: status,
//     censorId: censorId,
//     rejectionReason: rejectionReason,
//     createdAt: organization.createdAt,
//     updatedAt: new Date(),
//   };
// };

// export const generateMemberRole = (
//   member: Member,
//   roles: Role[],
//   granter: Account[],
// ) => {
//   const roleName = requireNonNullish(
//     _.sample([
//       OrganizationMemberRole.Manager,
//       OrganizationMemberRole.MemberManager,
//       OrganizationMemberRole.ActivityManager,
//     ]),
//   );
//   return {
//     memberId: member.id,
//     roleId: getOrganizationMemberRoleByName(roles, roleName).id,
//     grantedBy: _.sample(granter)?.id ?? null,
//     createdAt: member.createdAt,
//     updatedAt: new Date(),
//   };
// };

export const generateViContact = () => ({
  id: getNextContactId(),
  name: fakerVi.person.fullName(),
  email: fakerVi.internet.exampleEmail(),
  phoneNumber: fakerVi.phone.number(),
});

export const generateEnContact = () => ({
  id: getNextContactId(),
  name: fakerEn.person.fullName(),
  email: fakerEn.internet.exampleEmail(),
  phoneNumber: fakerEn.phone.number(),
});

export const capitalizeWords = (s: string) => {
  return s.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
};

export enum FileSizeUnit {
  B = 'B',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
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
export class WeightedRawLocation {
  weight: number;
  value: RawLocation;
}
export class RawLocation {
  locality: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export class ExtendedLocation extends RawLocation {
  id: number;
  addressLine1: string;
  addressLine2: string;
  createdAt: Date;
  updatedAt: Date;
}

export const readLocations = () => {
  const content = fs.readFileSync(
    path.join(__dirname, `./assets/worldcities.csv`),
    {
      encoding: 'utf8',
    },
  );
  const records: any[] = csv.parse(content, {
    bom: true,
    skipEmptyLines: true,
  });
  const municipalities = [
    'Ho Chi Minh City',
    'Hanoi',
    'Da Nang',
    'Haiphong',
    'Can Tho',
  ];
  const inMunicipalities = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
  ];
  const locations: { weight: number; value: RawLocation }[] = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record[0] == '') {
      break;
    }
    if (record[5] != 'VN') {
      continue;
    }
    const isMunicipality = municipalities.includes(record[1]);
    const isInMunicipality = inMunicipalities.includes(record[7]);
    locations.push({
      weight: isMunicipality || isInMunicipality ? 10 : 1,
      value: {
        locality: isMunicipality ? null : record[0],
        region: record[7],
        country: record[5],
        latitude: parseFloat(record[2]),
        longitude: parseFloat(record[3]),
      },
    });
  }
  return locations;
};

const weightedLocations: WeightedRawLocation[] = [];
const weightedLocationsGroupedByRegion: {
  [key: string]: WeightedRawLocation[];
} = {};

export const getWeightedLocations = () => {
  if (weightedLocations.length == 0) {
    weightedLocations.push(...readLocations());
  }
  return weightedLocations;
};

export const getWeightedLocationsGroupedByRegion = (region: string) => {
  if (weightedLocationsGroupedByRegion[region] == null) {
    weightedLocationsGroupedByRegion[region] = getWeightedLocations().filter(
      (l) => l.value.region == region,
    );
  }
  return weightedLocationsGroupedByRegion[region];
};

class ActivityTemplate {
  name: string;
  description: string;
  skillTypes: SkillType[];
}

const activityTemplates: ActivityTemplate[] = [];

const readActivityTemplates = () => {
  const activityTemplates: ActivityTemplate[] = [];
  const content = fs.readFileSync(path.join(__dirname, `./assets/events.csv`), {
    encoding: 'utf8',
  });
  const records: any[] = csv.parse(content, {
    bom: true,
    skipEmptyLines: true,
    fromLine: 2,
  });
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record[0] == '') {
      break;
    }
    const skillTypes: SkillType[] = [];
    const skillTypeName = record[9].trim();
    const skillType: SkillType | undefined = skillTypes.find(
      (s) => s == skillTypeName,
    );
    if (skillType != null) {
      skillTypes.push(skillType);
    }
    if (skillTypeName == 'Environment') {
      if (fakerEn.datatype.boolean()) {
        skillTypes.push(SkillType.Climate);
      }
      if (fakerEn.datatype.boolean()) {
        skillTypes.push(SkillType.Conservation);
      }
    }
    activityTemplates.push({
      name: record[4],
      description: record[6],
      skillTypes: skillTypes,
    });
  }
  const content2 = fs.readFileSync(
    path.join(__dirname, `./assets/events2.csv`),
    {
      encoding: 'utf8',
    },
  );
  const records2: any[] = csv.parse(content2, {
    bom: true,
    skipEmptyLines: true,
    fromLine: 2,
  });
  for (let i = 0; i < records2.length; i++) {
    const record = records2[i];
    if (record[0] == '') {
      break;
    }
    const skillTypes: SkillType[] = [];
    const skillTypeName = record[4].trim();
    const skillType: SkillType | undefined = skillTypes.find((s) =>
      s.includes(skillTypeName),
    );
    if (skillType != null) {
      skillTypes.push(skillType);
    }
    if (skillTypeName == 'Environment') {
      if (fakerEn.datatype.boolean()) {
        skillTypes.push(SkillType.Climate);
      }
      if (fakerEn.datatype.boolean()) {
        skillTypes.push(SkillType.Conservation);
      }
    } else if (skillTypeName.includes('Economic')) {
      skillTypes.push(SkillType.Job);
    }
    activityTemplates.push({
      name: record[1],
      description: record[3],
      skillTypes: skillTypes,
    });
  }
  return activityTemplates;
};

export const getActivityTemplates = () => {
  if (activityTemplates.length == 0) {
    activityTemplates.push(...readActivityTemplates());
  }
  return activityTemplates;
};

export const getActivityTemplateAt = (index: number) => {
  const templates = getActivityTemplates();
  return templates[index % templates.length];
};

// export const getOrganizationMemberRoleByName = (
//   roles: Role[],
//   roleName: OrganizationMemberRole,
// ) => {
//   const role = roles.find((r) => r.name == roleName);
//   if (!role) {
//     throw new Error('Role not found');
//   }
//   return role;
// };

// export const getOrganizationRoleNameById = (
//   roles: Role[],
//   roleId: number,
// ): OrganizationMemberRole => {
//   const role = roles.find((r) => r.id == roleId);
//   if (!role) {
//     throw new Error('Role not found');
//   }
//   return role.name as OrganizationMemberRole;
// };
