// import { ShortLocationOutputDto } from 'src/location/dtos';
import { TransformFnParams } from 'class-transformer';

export const separatedCommaNumberArrayTransform = (
  params: TransformFnParams,
) => {
  if (!params.value) {
    return undefined;
  }
  return params.value.split(',').map(Number);
};

type Location = {
  locality: string | null | undefined;
  region: string | null | undefined;
  country: string | null | undefined;
};

// export const unionLocationsTransform = (
//   locations: Location[],
// ): ShortLocationOutputDto | undefined => {
//   if (locations.length === 0) {
//     return undefined;
//   }

//   let locality: string | undefined = locations[0].locality || undefined;
//   let region: string | undefined = locations[0].region || undefined;
//   let country: string | undefined = locations[0].country || undefined;

//   if (locations.length == 1) {
//     const dto = new ShortLocationOutputDto();
//     dto.locality = locality;
//     dto.region = region;
//     dto.country = country;
//     return dto;
//   }

//   for (let i = 1; i < locations.length; i++) {
//     const location = locations[i];
//     if (locality != null && location.locality != null) {
//       if (locality.includes(location.locality)) {
//         locality = location.locality;
//       } else if (!location.locality.includes(locality)) {
//         locality = undefined;
//       }
//     }
//     if (region != null && location.region != null) {
//       if (region.includes(location.region)) {
//         region = location.region;
//       } else if (!location.region.includes(region)) {
//         region = undefined;
//       }
//     }
//     if (country != null && location.country != null) {
//       if (country.includes(location.country)) {
//         country = location.country;
//       } else if (!location.country.includes(country)) {
//         country = undefined;
//       }
//     }
//   }

//   const dto = new ShortLocationOutputDto();
//   dto.locality = locality;
//   dto.region = region;
//   dto.country = country;
//   return dto;
// };

export const stringToStringArrayTransform = (params: TransformFnParams) => {
  if (!params.value) {
    return undefined;
  }
  return params.value.split(',');
};

export const stringToBooleanTransform = (params: TransformFnParams) => {
  if (params.value === 'true') {
    return true;
  }
  if (params.value === 'false') {
    return false;
  }
  return params;
};

export const stringToBooleanArrayTransform = (params: TransformFnParams) => {
  if (!params.value) {
    return undefined;
  }
  return params.value.split(',').map((v) => {
    if (v === 'true') {
      return true;
    }
    if (v === 'false') {
      return false;
    }
    return v;
  });
};

export const stringToIntTransform = (params: TransformFnParams) => {
  return parseInt(params.value);
};

export const stringToIntArrayTransform = (params: TransformFnParams) => {
  if (!params.value) {
    return undefined;
  }
  return params.value.split(',').map((v) => parseInt(v));
};

export const stringToFloatTransform = (params: TransformFnParams) => {
  return parseFloat(params.value);
};

export const stringToFloatArrayTransform = (params: TransformFnParams) => {
  if (!params.value) {
    return undefined;
  }
  return params.value.split(',').map((v) => parseFloat(v));
};

export const stringToDateTransform = (params: TransformFnParams) => {
  return new Date(params.value);
};
