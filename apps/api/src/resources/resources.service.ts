import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { STORAGE_PROVIDER, StorageProvider } from '../storage/storage.interface';
import { UrlDetectorService } from './url-detector.service';
import { UrlMetadataScraperService } from './url-metadata-scraper.service';
import { FileValidatorService } from './file-validator.service';
import {
  CreateUrlResourceDto,
  CreateFileResourceDto,
  PresignUploadDto,
  CompletePresignedUploadDto,
  UpdateResourceDto,
  AssignResourceDto,
  MoveResourceDto,
  ResourceQueryDto,
  ResourceResponse,
  ResourceLocationType,
  ResourceProcessingStatus,
} from '@ascendiaos/shared';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly urlDetector: UrlDetectorService,
    private readonly urlMetadataScraper: UrlMetadataScraperService,
    private readonly fileValidator: FileValidatorService,
  ) {}

  async createUrlResource(userId: string, dto: CreateUrlResourceDto): Promise<ResourceResponse> {
    const targetLocation = await this.resolveAndValidateLocation(userId, dto);

    const scraped = await this.urlMetadataScraper.scrape(dto.url);
    const title = dto.title || scraped.title;

    const resource = await this.db.resource.create({
      data: {
        userId,
        locationType: targetLocation.locationType,
        type: scraped.type,
        title,
        description: dto.description || scraped.description || null,
        url: dto.url,
        thumbnailUrl: scraped.thumbnailUrl || null,
        provider: scraped.provider || null,
        externalId: scraped.externalId || null,
        metadata: (scraped.metadata as any) || {},
        status: ResourceProcessingStatus.READY,
        examId: targetLocation.examId,
        subjectId: targetLocation.subjectId,
        chapterId: targetLocation.chapterId,
        topicId: targetLocation.topicId,
      },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return this.mapToResponse(resource);
  }

  async createFileResource(
    userId: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    dto: CreateFileResourceDto,
  ): Promise<ResourceResponse> {
    const validated = this.fileValidator.validateFile(filename, mimeType, fileBuffer.length);
    const targetLocation = await this.resolveAndValidateLocation(userId, dto);

    const { storageKey } = await this.storage.upload(fileBuffer, validated.sanitizedFilename, validated.mimeType);

    const title = dto.title || validated.sanitizedFilename;

    const resource = await this.db.resource.create({
      data: {
        userId,
        locationType: targetLocation.locationType,
        type: validated.type,
        title,
        description: dto.description || null,
        filename: validated.sanitizedFilename,
        mimeType: validated.mimeType,
        sizeBytes: validated.sizeBytes,
        storageKey,
        status: ResourceProcessingStatus.READY,
        examId: targetLocation.examId,
        subjectId: targetLocation.subjectId,
        chapterId: targetLocation.chapterId,
        topicId: targetLocation.topicId,
      },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return this.mapToResponse(resource);
  }

  async getPresignedUpload(
    userId: string,
    dto: PresignUploadDto,
  ): Promise<{ uploadUrl: string; storageKey: string }> {
    this.fileValidator.validateFile(dto.filename, dto.mimeType, dto.sizeBytes);

    if (this.storage.getPresignedUploadUrl) {
      return this.storage.getPresignedUploadUrl(dto.filename, dto.mimeType);
    }

    return {
      uploadUrl: `/api/resources/upload`,
      storageKey: '',
    };
  }

  async completePresignedUpload(userId: string, dto: CompletePresignedUploadDto): Promise<ResourceResponse> {
    const validated = this.fileValidator.validateFile(dto.filename, dto.mimeType, dto.sizeBytes);
    const targetLocation = await this.resolveAndValidateLocation(userId, dto);

    const resource = await this.db.resource.create({
      data: {
        userId,
        locationType: targetLocation.locationType,
        type: validated.type,
        title: dto.title || validated.sanitizedFilename,
        description: dto.description || null,
        filename: validated.sanitizedFilename,
        mimeType: validated.mimeType,
        sizeBytes: validated.sizeBytes,
        storageKey: dto.storageKey,
        status: ResourceProcessingStatus.READY,
        examId: targetLocation.examId,
        subjectId: targetLocation.subjectId,
        chapterId: targetLocation.chapterId,
        topicId: targetLocation.topicId,
      },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return this.mapToResponse(resource);
  }

  async getResources(
    userId: string,
    query: ResourceQueryDto,
  ): Promise<{ items: ResourceResponse[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { filename: { contains: q, mode: 'insensitive' } },
        { url: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.locationType) {
      where.locationType = query.locationType;
    }

    if (query.examId) {
      where.examId = query.examId;
    }

    if (query.subjectId) {
      where.subjectId = query.subjectId;
    }

    if (query.chapterId) {
      where.chapterId = query.chapterId;
    }

    if (query.topicId) {
      where.topicId = query.topicId;
    }

    if (query.isCompleted !== undefined) {
      where.isCompleted = query.isCompleted;
    }

    if (query.isAssigned === true) {
      where.locationType = { not: ResourceLocationType.INBOX };
    } else if (query.isAssigned === false) {
      where.locationType = ResourceLocationType.INBOX;
    }

    const [resources, total] = await Promise.all([
      this.db.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          exam: { select: { id: true, title: true } },
          subject: { select: { id: true, name: true } },
          chapter: { select: { id: true, name: true } },
          topic: { select: { id: true, name: true } },
        },
      }),
      this.db.resource.count({ where }),
    ]);

    return {
      items: resources.map((r) => this.mapToResponse(r)),
      total,
      page,
      limit,
    };
  }

  async getInbox(userId: string): Promise<ResourceResponse[]> {
    const resources = await this.db.resource.findMany({
      where: {
        userId,
        locationType: ResourceLocationType.INBOX,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return resources.map((r) => this.mapToResponse(r));
  }

  async getResourceById(userId: string, id: string): Promise<ResourceResponse> {
    const resource = await this.db.resource.findFirst({
      where: { id, userId },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource not found or access denied`);
    }

    return this.mapToResponse(resource);
  }

  async getFileBuffer(userId: string, id: string): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const resource = await this.db.resource.findFirst({
      where: { id, userId },
    });

    if (!resource || !resource.storageKey) {
      throw new NotFoundException('Resource file not found');
    }

    const buffer = await this.storage.get(resource.storageKey);
    return {
      buffer,
      filename: resource.filename || 'download',
      mimeType: resource.mimeType || 'application/octet-stream',
    };
  }

  async getDownloadUrl(userId: string, id: string): Promise<{ downloadUrl: string }> {
    const resource = await this.db.resource.findFirst({
      where: { id, userId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.url) {
      return { downloadUrl: resource.url };
    }

    if (!resource.storageKey) {
      throw new BadRequestException('Resource has no attached file');
    }

    if (this.storage.getSignedDownloadUrl) {
      const signedUrl = await this.storage.getSignedDownloadUrl(resource.storageKey);
      return { downloadUrl: signedUrl };
    }

    return { downloadUrl: `/api/resources/${id}/file` };
  }

  async updateResource(userId: string, id: string, dto: UpdateResourceDto): Promise<ResourceResponse> {
    const existing = await this.db.resource.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Resource not found');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isCompleted !== undefined) {
      data.isCompleted = dto.isCompleted;
      data.completedAt = dto.isCompleted ? new Date() : null;
    }

    const updated = await this.db.resource.update({
      where: { id },
      data,
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return this.mapToResponse(updated);
  }

  async assignResource(userId: string, id: string, dto: AssignResourceDto): Promise<ResourceResponse> {
    const existing = await this.db.resource.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Resource not found');
    }

    const targetLocation = await this.resolveAndValidateLocation(userId, dto);

    const updated = await this.db.resource.update({
      where: { id },
      data: {
        locationType: targetLocation.locationType,
        examId: targetLocation.examId,
        subjectId: targetLocation.subjectId,
        chapterId: targetLocation.chapterId,
        topicId: targetLocation.topicId,
      },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return this.mapToResponse(updated);
  }

  async moveResource(userId: string, id: string, dto: MoveResourceDto): Promise<ResourceResponse> {
    return this.assignResource(userId, id, dto);
  }

  async deleteResource(userId: string, id: string): Promise<{ success: boolean }> {
    const existing = await this.db.resource.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Resource not found');
    }

    if (existing.storageKey) {
      try {
        await this.storage.delete(existing.storageKey);
      } catch (err) {
        this.logger.error(`Failed to delete storage key ${existing.storageKey}`, err);
      }
    }

    await this.db.resource.delete({ where: { id } });
    return { success: true };
  }

  private async resolveAndValidateLocation(
    userId: string,
    dto: {
      locationType?: string;
      examId?: string | null;
      subjectId?: string | null;
      chapterId?: string | null;
      topicId?: string | null;
    },
  ): Promise<{
    locationType: ResourceLocationType;
    examId: string | null;
    subjectId: string | null;
    chapterId: string | null;
    topicId: string | null;
  }> {
    let topicId = dto.topicId || null;
    let chapterId = dto.chapterId || null;
    let subjectId = dto.subjectId || null;
    let examId = dto.examId || null;

    // 1. Topic specified
    if (topicId) {
      const topic = await this.db.topic.findFirst({
        where: { id: topicId, userId },
        include: {
          chapter: {
            include: {
              subject: true,
            },
          },
        },
      });
      if (!topic) {
        throw new ForbiddenException('Topic not found or access denied');
      }
      chapterId = topic.chapterId;
      subjectId = topic.chapter.subjectId;
      examId = topic.chapter.subject.examId;

      return {
        locationType: ResourceLocationType.TOPIC,
        examId,
        subjectId,
        chapterId,
        topicId,
      };
    }

    // 2. Chapter specified
    if (chapterId) {
      const chapter = await this.db.chapter.findFirst({
        where: { id: chapterId, userId },
        include: { subject: true },
      });
      if (!chapter) {
        throw new ForbiddenException('Chapter not found or access denied');
      }
      subjectId = chapter.subjectId;
      examId = chapter.subject.examId;

      return {
        locationType: ResourceLocationType.CHAPTER,
        examId,
        subjectId,
        chapterId,
        topicId: null,
      };
    }

    // 3. Subject specified
    if (subjectId) {
      const subject = await this.db.subject.findFirst({
        where: { id: subjectId, userId },
      });
      if (!subject) {
        throw new ForbiddenException('Subject not found or access denied');
      }
      examId = subject.examId;

      return {
        locationType: ResourceLocationType.SUBJECT,
        examId,
        subjectId,
        chapterId: null,
        topicId: null,
      };
    }

    // 4. Exam specified
    if (examId) {
      const exam = await this.db.exam.findFirst({
        where: { id: examId, userId },
      });
      if (!exam) {
        throw new ForbiddenException('Exam not found or access denied');
      }

      return {
        locationType: ResourceLocationType.EXAM,
        examId,
        subjectId: null,
        chapterId: null,
        topicId: null,
      };
    }

    // Default: Inbox
    return {
      locationType: ResourceLocationType.INBOX,
      examId: null,
      subjectId: null,
      chapterId: null,
      topicId: null,
    };
  }

  private mapToResponse(resource: any): ResourceResponse {
    return {
      id: resource.id,
      userId: resource.userId,
      locationType: resource.locationType,
      type: resource.type,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      filename: resource.filename,
      mimeType: resource.mimeType,
      sizeBytes: resource.sizeBytes,
      storageKey: resource.storageKey,
      thumbnailUrl: resource.thumbnailUrl,
      status: resource.status,
      provider: resource.provider,
      externalId: resource.externalId,
      metadata: resource.metadata,
      isCompleted: resource.isCompleted,
      completedAt: resource.completedAt ? resource.completedAt.toISOString() : null,
      examId: resource.examId,
      subjectId: resource.subjectId,
      chapterId: resource.chapterId,
      topicId: resource.topicId,
      exam: resource.exam ? { id: resource.exam.id, title: resource.exam.title } : null,
      subject: resource.subject ? { id: resource.subject.id, name: resource.subject.name } : null,
      chapter: resource.chapter ? { id: resource.chapter.id, name: resource.chapter.name } : null,
      topic: resource.topic ? { id: resource.topic.id, name: resource.topic.name } : null,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
    };
  }
}
