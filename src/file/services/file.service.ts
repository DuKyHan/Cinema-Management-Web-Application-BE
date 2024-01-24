
import { BucketAlreadyExists, NoSuchKey, S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { File, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { Readable } from 'stream';
import { PrismaService } from '../../prisma';
import { FileQueryDto } from '../dtos';
import { DownloadFileQueryDto } from '../dtos/download-file.query.dto';
import { FileOutputDto } from '../dtos/file-output.dto';
import { UploadFileOutputDto } from '../dtos/upload-file-output.dto';
import { FileProcessingHasNotFinished } from '../exceptions';
import { FileNotFoundException } from '../exceptions/file-not-found.exception';
import { AbstractService } from 'src/common/services';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { normalizeFileSize } from 'src/common/utils';
import fileConfig from 'src/common/configs/subconfigs/file.config';

@Injectable()
export class FileService extends AbstractService {
  private readonly client: S3;
  private readonly bucket: string;

  constructor(
    @Inject(fileConfig.KEY) fileConfigApi: ConfigType<typeof fileConfig>,
    private readonly prisma: PrismaService,
    logger: AppLogger,
  ) {
    super(logger);
    this.client = new S3({
      endpoint: fileConfigApi.endpoint,
      region: fileConfigApi.region,
      credentials: {
        accessKeyId: fileConfigApi.accessKey,
        secretAccessKey: fileConfigApi.secretKey,
      },
    });
    this.bucket = fileConfigApi.bucket;
    this.setup();
  }

  async setup() {
    // try {
    //   await this.client.createBucket({
    //     Bucket: this.bucket,
    //   });
    // } catch (err) {
    //   if (!(err instanceof BucketAlreadyExists)) {
    //     throw err;
    //   }
    // }
  }

  async listFiles(
    ctx: RequestContext,
    query: FileQueryDto,
  ): Promise<FileOutputDto[]> {
    this.logCaller(ctx, this.listFiles);
    const files = await this.prisma.file.findMany({
      where: {
        id: {
          in: query.ids,
        },
        createdBy: ctx.account.id,
      },
      take: query.limit,
      skip: query.offset,
    });
    return this.outputArray(FileOutputDto, files);
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<FileOutputDto | undefined> {
    this.logCaller(context, this.getById);

    return this.output(
      FileOutputDto,
      await this.prisma.file.findUnique({ where: { id: id } }),
    );
  }

  async uploadFile(
    ctx: RequestContext,
    uploadFile: Express.Multer.File,
  ): Promise<UploadFileOutputDto> {
    this.logCaller(ctx, this.uploadFile);

    const key = nanoid();
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Body: uploadFile.buffer,
        Key: key,
        Metadata: {
          originalname: uploadFile.originalname,
          mimetype: uploadFile.mimetype,
        },
      },
      queueSize: 4, // optional concurrency configuration
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    });

    upload.on('httpUploadProgress', (progress) => {
      if (progress.loaded != null && progress.total != null) {
        this.logger.log(
          ctx,
          `file upload progress: ${Math.round(
            (progress.loaded / progress.total) * 100,
          )}%`,
        );
      }
    });

    await this.uploadFileToS3(ctx, upload);

    const normalizedFileSize = normalizeFileSize(uploadFile.size);
    const file = {
      name: uploadFile.originalname,
      internalName: key,
      mimetype: uploadFile.mimetype,
      path: '/',
      size: normalizedFileSize.size,
      sizeUnit: normalizedFileSize.unit,
      createdBy: ctx.account.id,
    };

    const res = await this.createFile(ctx, file);
    return this.output(UploadFileOutputDto, res);
  }

  async createFile(
    ctx: RequestContext,
    file: Prisma.FileUncheckedCreateInput,
  ): Promise<FileOutputDto> {
    this.logCaller(ctx, this.createFile);

    return this.output(
      FileOutputDto,
      await this.prisma.file.create({ data: file }),
    );
  }

  private async uploadFileToS3(ctx: RequestContext, upload: Upload) {
    this.logger.log(ctx, 'start uploading file');
    const startTime = Date.now();
    await upload.done();
    this.logger.log(
      ctx,
      `upload file completed, took ${Date.now() - startTime} ms`,
    );
  }

  async downloadFileById(
    ctx: RequestContext,
    id: number,
    query?: DownloadFileQueryDto,
  ): Promise<{ stream: Readable; file: FileOutputDto }> {
    this.logCaller(ctx, this.downloadFileById);
    const file = await this.prisma.file.findUnique({ where: { id: id } });
    return this.downloadFile(file, query);
  }

  async downloadFileByInternalName(
    context: RequestContext,
    name: string,
    query?: DownloadFileQueryDto,
  ): Promise<{ stream: Readable; file: FileOutputDto }> {
    this.logCaller(context, this.downloadFileByInternalName);
    const file = await this.prisma.file.findUnique({
      where: { internalName: name },
    });
    return this.downloadFile(file, query);
  }

  private async downloadFile(
    file: File | null,
    query?: DownloadFileQueryDto,
  ): Promise<{ stream: Readable; file: FileOutputDto }> {
    const safeFile = await this.validateDownloadFile(file, query);
    try {
      const stream = await this.downloadFileFromS3(safeFile);
      return {
        stream: stream,
        file: {
          id: safeFile.id,
          name: safeFile.name,
          internalName: safeFile.internalName,
          size: safeFile.size,
          sizeUnit: safeFile.sizeUnit,
          mimetype: safeFile.mimetype ?? undefined,
        },
      };
    } catch (err) {
      if (err instanceof NoSuchKey) {
        throw new FileProcessingHasNotFinished();
      }
      throw err;
    }
  }

  private validateDownloadFile(
    file: File | null,
    query?: DownloadFileQueryDto,
  ): File {
    if (!file) {
      throw new FileNotFoundException();
    }

    if (query) {
      const type = query.type;
      const subtype = query.subtype;

      if (type != null) {
        if (!file.mimetype || !file.mimetype.startsWith(type)) {
          throw new FileNotFoundException();
        }
        if (subtype != null && file.mimetype !== `${type}/${subtype}`) {
          throw new FileNotFoundException();
        }
      }
    }

    return file;
  }

  private async downloadFileFromS3(file: File): Promise<Readable> {
    const res = await this.client.getObject({
      Bucket: this.bucket,
      Key: file.internalName,
    });
    return res.Body as Readable;
  }
}
