import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResourcesService } from './resources.service';
import { UrlMetadataScraperService } from './url-metadata-scraper.service';
import { Response } from 'express';
import {
  CreateUrlResourceSchema,
  CreateFileResourceSchema,
  PresignUploadSchema,
  CompletePresignedUploadSchema,
  UpdateResourceSchema,
  AssignResourceSchema,
  MoveResourceSchema,
  ResourceQuerySchema,
} from '@studyos/shared';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly urlMetadataScraper: UrlMetadataScraperService,
  ) {}

  @Post('url')
  async createUrlResource(@Req() req: any, @Body() body: any) {
    const validated = CreateUrlResourceSchema.parse(body);
    return this.resourcesService.createUrlResource(req.user.id, validated);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileResource(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const dto = CreateFileResourceSchema.parse({
      title: body.title || file.originalname,
      description: body.description,
      locationType: body.locationType,
      examId: body.examId,
      subjectId: body.subjectId,
      chapterId: body.chapterId,
      topicId: body.topicId,
    });

    return this.resourcesService.createFileResource(
      req.user.id,
      file.buffer,
      file.originalname,
      file.mimetype,
      dto,
    );
  }

  @Post('presign')
  async getPresignedUpload(@Req() req: any, @Body() body: any) {
    const validated = PresignUploadSchema.parse(body);
    return this.resourcesService.getPresignedUpload(req.user.id, validated);
  }

  @Post('complete-upload')
  async completePresignedUpload(@Req() req: any, @Body() body: any) {
    const validated = CompletePresignedUploadSchema.parse(body);
    return this.resourcesService.completePresignedUpload(req.user.id, validated);
  }

  @Get()
  async getResources(@Req() req: any, @Query() query: any) {
    const parsedQuery = ResourceQuerySchema.parse({
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      isCompleted: query.isCompleted !== undefined ? query.isCompleted === 'true' : undefined,
      isAssigned: query.isAssigned !== undefined ? query.isAssigned === 'true' : undefined,
    });
    return this.resourcesService.getResources(req.user.id, parsedQuery);
  }

  @Get('inbox')
  async getInbox(@Req() req: any) {
    return this.resourcesService.getInbox(req.user.id);
  }

  @Get('detect-url')
  async detectUrlMetadata(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL parameter is required');
    }
    return this.urlMetadataScraper.scrape(url);
  }

  @Get(':id')
  async getResourceById(@Req() req: any, @Param('id') id: string) {
    return this.resourcesService.getResourceById(req.user.id, id);
  }

  @Get(':id/download')
  async getDownloadUrl(@Req() req: any, @Param('id') id: string) {
    return this.resourcesService.getDownloadUrl(req.user.id, id);
  }

  @Get(':id/file')
  async streamFile(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
    const { buffer, filename, mimeType } = await this.resourcesService.getFileBuffer(
      req.user.id,
      id,
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  }

  @Patch(':id')
  async updateResource(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const validated = UpdateResourceSchema.parse(body);
    return this.resourcesService.updateResource(req.user.id, id, validated);
  }

  @Post(':id/assign')
  async assignResource(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const validated = AssignResourceSchema.parse(body);
    return this.resourcesService.assignResource(req.user.id, id, validated);
  }

  @Post(':id/move')
  async moveResource(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const validated = MoveResourceSchema.parse(body);
    return this.resourcesService.moveResource(req.user.id, id, validated);
  }

  @Delete(':id')
  async deleteResource(@Req() req: any, @Param('id') id: string) {
    return this.resourcesService.deleteResource(req.user.id, id);
  }
}
