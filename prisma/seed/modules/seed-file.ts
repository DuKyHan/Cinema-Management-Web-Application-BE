import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { File, PrismaClient } from '@prisma/client';
import { Axios } from 'axios';
import mimeTypes from 'mime-types';
import { nanoid } from 'nanoid';
import fs from 'node:fs';
import path from 'path';
import { getNextFileId, normalizeFileSize, requireNonNullish } from '../utils';

type FileOutput = { path: string; name: string; mimetype?: string };

const DEFAULT_MIME_TYPE = 'text/plain';

const s3Client = new S3({
  endpoint: process.env.FILE_ENDPOINT,
  region: process.env.FILE_REGION,
  credentials: {
    accessKeyId: requireNonNullish(process.env.FILE_ACCESS_KEY),
    secretAccessKey: requireNonNullish(process.env.FILE_SECRET_KEY),
  },
});
const bucket = requireNonNullish(process.env.FILE_BUCKET);

const axios = new Axios({
  headers: {
    'Access-Control-Expose-Headers': '*',
  },
});

export const resetBucket = async () => {
  try {
    console.log('🕓 Deleting objects in batches');
    let batchIndex = 1;
    let objects = await s3Client.listObjectsV2({ Bucket: bucket });
    while (objects.Contents) {
      console.log(
        `Batch ${batchIndex}: Deleting ${objects.Contents.length} objects`,
      );
      await s3Client.deleteObjects({
        Bucket: bucket,
        Delete: {
          Objects: objects.Contents.map((obj) => ({ Key: obj.Key })),
        },
      });
      objects = await s3Client.listObjectsV2({ Bucket: bucket });
      batchIndex++;
    }
  } catch (err) {
    console.error('Failed to reset bucket');
    console.log(err);
    return;
  }

  // try {
  //   await s3Client.deleteBucket({
  //     Bucket: bucket,
  //   });
  // } catch (err) {
  //   console.error('Failed to delete bucket');
  //   console.log(err);
  // }

  // try {
  //   await s3Client.createBucket({
  //     Bucket: bucket,
  //   });
  // } catch (err) {
  //   console.error('Failed to create bucket');
  //   console.log(err);
  // }
};

// Let you control the file to be downloaded
export class SeedControlledFileOption {
  constructor(
    // Return the download option in case file does not exist, this includes the url and the file name
    public readonly downloadOption: {
      url: string;
      fileName?: string;
    },
    // Return the file path to check if file already exist
    public readonly filePathToCheckIfExist: string,
  ) {}
}

// Let you generate random files
export class SeedRandomFileOption {
  constructor(
    // Use url to download new file if there is not enough files exist on the output folder
    public readonly downloadOption: {
      url: string;
      fileName?: string;
    },
    // Return the number of files to be generated
    public readonly count: number,
  ) {}
}

class DownloadFile {
  constructor(
    public readonly url: string,
    public readonly fileName?: string,
  ) {}
}

export const seedFiles = async (
  prisma: PrismaClient,
  relativeOutputFolderPath: string,
  rawSeedFileOption: SeedControlledFileOption[] | SeedRandomFileOption,
  options?: {
    skipInsertIntoDatabase?: boolean;
  },
) => {
  // Cast seedFileOption to SeedRandomFileOption if it is an array
  const seedFileOption = Array.isArray(rawSeedFileOption)
    ? rawSeedFileOption.map(
        (e) =>
          new SeedControlledFileOption(
            e.downloadOption,
            e.filePathToCheckIfExist,
          ),
      )
    : new SeedRandomFileOption(
        rawSeedFileOption.downloadOption,
        rawSeedFileOption.count,
      );

  if (options?.skipInsertIntoDatabase) {
    const files: File[] = [];
    const count =
      seedFileOption instanceof SeedRandomFileOption
        ? seedFileOption.count
        : seedFileOption.length;
    for (let i = 0; i < count; i++) {
      files.push({
        id: getNextFileId(),
        name: `file-${i}`,
        internalName: `file-${i}`,
        mimetype: DEFAULT_MIME_TYPE,
        path: '/',
        size: 0,
        sizeUnit: 'B',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return files;
  }

  const files: (File | null)[] = [];
  const outputFolderPath = path.join(__dirname, relativeOutputFolderPath);
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath, { recursive: true });
  }

  let fileUrls: (string | DownloadFile)[] = [];
  // If seedFileOption is SeedRandomFileOption, generate random files
  if (typeof seedFileOption === 'object' && 'count' in seedFileOption) {
    fileUrls = fs.readdirSync(outputFolderPath);
    const remainingFiles = seedFileOption.count - fileUrls.length;
    for (let i = 0; i < remainingFiles; i++) {
      const downloadOption = seedFileOption.downloadOption;
      fileUrls.push(
        new DownloadFile(downloadOption.url, downloadOption.fileName),
      );
    }
  } else {
    for (const filePath of seedFileOption) {
      const downloadOption = filePath.downloadOption;
      const filePathToCheckIfExist = filePath.filePathToCheckIfExist;
      // If file already exist, skip downloading
      if (fs.existsSync(path.join(outputFolderPath, filePathToCheckIfExist))) {
        fileUrls.push(filePathToCheckIfExist);
        continue;
      }
      // If file does not exist, download
      fileUrls.push(
        new DownloadFile(downloadOption.url, downloadOption.fileName),
      );
    }
  }

  const remainingFiles = fileUrls.filter(
    (e) => e instanceof DownloadFile,
  ).length;
  if (remainingFiles > 0) {
    console.log(` |_ ⭳ Downloading ${remainingFiles} files...`);
  }

  const downloads: Promise<FileOutput>[] = [];

  for (let i = 0; i < fileUrls.length; i++) {
    const fileUrl = fileUrls[i];
    if (fileUrl instanceof DownloadFile) {
      downloads.push(
        downloadFileAndSave(fileUrl.url, outputFolderPath, fileUrl.fileName),
      );
      continue;
    }
    const filePath = path.join(outputFolderPath, fileUrl);
    downloads.push(getLocalFile(filePath));
  }
  const downloadedFiles: (FileOutput | null)[] = [];
  for (let i = 0; i < downloads.length; i++) {
    const download = downloads[i];
    try {
      const downloadedFile = await download;
      downloadedFiles.push(downloadedFile);
    } catch (err) {
      downloadedFiles.push(null);
    }
  }

  const uploads: Promise<File | null>[] = [];
  downloadedFiles.forEach((file) => {
    if (file == null) {
      uploads.push(Promise.resolve(null));
      return;
    }
    const fileStat = fs.statSync(file.path);
    const buffer = fs.readFileSync(file.path);
    const upload = uploadFileToStorage(
      buffer,
      file.name,
      fileStat,
      file.mimetype,
    );
    uploads.push(upload);
  });
  const uploadedFiles: (File | null)[] = [];
  for (let i = 0; i < uploads.length; i++) {
    const upload = uploads[i];
    try {
      const uploadedFile = await upload;
      uploadedFiles.push(uploadedFile);
    } catch (err) {
      uploadedFiles.push(null);
    }
  }

  await prisma.file.createMany({
    data: uploadedFiles.filter((file): file is File => file != null),
  });

  files.push(...uploadedFiles);

  return files;
};

const uploadFileToStorage = async (
  buffer: Buffer,
  originalname: string,
  fileStat: fs.Stats,
  mimetype?: string,
) => {
  const key = nanoid();
  const metadata = {
    originalname,
  };
  if (mimetype) {
    metadata['mimetype'] = mimetype;
  }
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Body: buffer,
      Key: key,
      Metadata: metadata,
    },
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false, // optional manually handle dropped parts
  });
  try {
    await upload.done();
  } catch (err) {
    return null;
  }

  const normalizedFileSize = normalizeFileSize(fileStat.size);
  return createFile({
    originalname,
    internalName: key,
    mimetype,
    size: normalizedFileSize.size,
    sizeUnit: normalizedFileSize.unit,
  });
};

const createFile = (data: {
  originalname: string;
  internalName: string;
  mimetype?: string;
  size: number;
  sizeUnit: string;
}) => {
  const file: File = {
    id: getNextFileId(),
    name: data.originalname,
    internalName: data.internalName,
    mimetype: data.mimetype ?? DEFAULT_MIME_TYPE,
    path: '/',
    size: data.size,
    sizeUnit: data.sizeUnit,
    createdBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return file;
};

const downloadFileAndSave = async (
  url: string,
  outputFolderPath: string,
  fileName?: string,
) => {
  return axios.get(url, { responseType: 'stream' }).then((response) => {
    return new Promise<FileOutput>((resolve, reject) => {
      let filename: string;
      let mimetype: string | undefined;
      if (fileName) {
        filename = fileName;
        mimetype = mimeTypes.lookup(fileName) || undefined;
      } else {
        mimetype = (
          response.headers['content-type'] || response.headers['Content-Type']
        )
          ?.split(';')
          .shift();
        const ext =
          (mimetype == null ? undefined : mimeTypes.extension(mimetype)) ?? '';
        const contentDisposition: string | undefined =
          response.headers['content-disposition'] ||
          response.headers['Content-Disposition'];
        if (
          contentDisposition == null ||
          contentDisposition === 'inline' ||
          contentDisposition === 'attachment'
        ) {
          filename = `${nanoid()}.${ext}`;
        } else {
          filename = contentDisposition.split('filename=')[1];
        }
      }

      const filepath = path.join(outputFolderPath, filename);
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error: Error | null = null;

      writer.on('error', (err) => {
        console.log('🚨 Failed to download file');
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve({
            path: filepath,
            name: filename,
            mimetype: mimetype,
          });
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
};

const getLocalFile = async (filepath: string): Promise<FileOutput> => {
  const filename = path.basename(filepath);
  return {
    path: filepath,
    name: filename,
    mimetype: mimeTypes.lookup(filepath) || undefined,
  };
};
