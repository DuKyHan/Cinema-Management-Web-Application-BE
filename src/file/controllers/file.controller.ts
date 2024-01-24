
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Public } from '../../auth/decorators';
import { FileQueryDto } from '../dtos';
import { UploadFileOutputDto } from '../dtos/upload-file-output.dto';
import { UploadFilePipe } from '../pipes';
import { FileService } from '../services';
import { ReqContext, RequestContext } from 'src/common/request-context';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getFiles(
    @ReqContext() context: RequestContext,
    @Query() query: FileQueryDto,
  ) {
    return this.fileService.listFiles(context, query);
  }

  @Get(':id')
  async getFileById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.fileService.getById(context, id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @ReqContext() context: RequestContext,
    @UploadedFile(UploadFilePipe) file: Express.Multer.File,
  ): Promise<UploadFileOutputDto> {
    return this.fileService.uploadFile(context, file);
  }

  @Get('download/:id')
  async downloadFileById(
    @ReqContext() ctx: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const fileInfo = await this.fileService.downloadFileById(ctx, id);
    return new StreamableFile(fileInfo.stream, {
      type: fileInfo.file.mimetype,
      disposition: `attachment; filename="${fileInfo.file.name}"`,
    });
  }

  @Public()
  @Get('public/image/i/:id')
  async downloadPublicImageById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<StreamableFile> {
    const fileInfo = await this.fileService.downloadFileById(context, id, {
      type: 'image',
    });
    return new StreamableFile(fileInfo.stream, {
      type: fileInfo.file.mimetype,
      disposition: `inline`,
    });
  }

  @Public()
  @Get('public/image/n/:name')
  async downloadPublicImageByName(
    @ReqContext() context: RequestContext,
    @Param('name') internalName: string,
  ): Promise<StreamableFile> {
    const fileInfo = await this.fileService.downloadFileByInternalName(
      context,
      internalName,
      {
        type: 'image',
      },
    );
    return new StreamableFile(fileInfo.stream, {
      type: fileInfo.file.mimetype,
      disposition: `inline`,
    });
  }
}
