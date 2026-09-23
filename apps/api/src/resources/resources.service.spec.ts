import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { DatabaseService } from '../database/database.service';
import { STORAGE_PROVIDER } from '../storage/storage.interface';
import { UrlDetectorService } from './url-detector.service';
import { UrlMetadataScraperService } from './url-metadata-scraper.service';
import { FileValidatorService } from './file-validator.service';
import { ResourceType, ResourceLocationType, ResourceProcessingStatus } from '@studyos/shared';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let db: any;
  let storage: any;
  let urlDetector: UrlDetectorService;
  let urlMetadataScraper: UrlMetadataScraperService;
  let fileValidator: FileValidatorService;

  const mockUser = { id: 'user-1' };
  const mockUser2 = { id: 'user-2' };

  const mockResource = {
    id: 'res-1',
    userId: 'user-1',
    locationType: ResourceLocationType.INBOX,
    type: ResourceType.YOUTUBE_VIDEO,
    title: 'Bayes Theorem Video',
    description: 'Learn Bayes Theorem',
    url: 'https://youtube.com/watch?v=12345',
    filename: null,
    mimeType: null,
    sizeBytes: null,
    storageKey: null,
    thumbnailUrl: 'https://img.youtube.com/vi/12345/hqdefault.jpg',
    status: ResourceProcessingStatus.READY,
    provider: 'YouTube',
    externalId: '12345',
    metadata: {},
    isCompleted: false,
    completedAt: null,
    examId: null,
    subjectId: null,
    chapterId: null,
    topicId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    exam: null,
    subject: null,
    chapter: null,
    topic: null,
  };

  beforeEach(async () => {
    db = {
      resource: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      topic: {
        findFirst: jest.fn(),
      },
      chapter: {
        findFirst: jest.fn(),
      },
      subject: {
        findFirst: jest.fn(),
      },
      exam: {
        findFirst: jest.fn(),
      },
    };

    storage = {
      upload: jest.fn().mockResolvedValue({ storageKey: 'mock-storage-key' }),
      get: jest.fn().mockResolvedValue(Buffer.from('file content')),
      delete: jest.fn().mockResolvedValue(true),
      getPresignedUploadUrl: jest.fn().mockResolvedValue({
        uploadUrl: 'https://s3.amazonaws.com/presigned-upload',
        storageKey: 'presigned-key',
      }),
      getSignedDownloadUrl: jest.fn().mockResolvedValue('https://s3.amazonaws.com/presigned-download'),
    };

    urlDetector = new UrlDetectorService();
    urlMetadataScraper = new UrlMetadataScraperService(urlDetector);
    fileValidator = new FileValidatorService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: DatabaseService, useValue: db },
        { provide: STORAGE_PROVIDER, useValue: storage },
        { provide: UrlDetectorService, useValue: urlDetector },
        { provide: UrlMetadataScraperService, useValue: urlMetadataScraper },
        { provide: FileValidatorService, useValue: fileValidator },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
  });

  describe('UrlDetectorService & SSRF Validation', () => {
    it('should detect YouTube video URLs', () => {
      const info = urlDetector.detect('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(info.type).toBe(ResourceType.YOUTUBE_VIDEO);
      expect(info.provider).toBe('YouTube');
      expect(info.externalId).toBe('dQw4w9WgXcQ');
      expect(info.thumbnailUrl).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });

    it('should detect YouTube playlist URLs', () => {
      const info = urlDetector.detect('https://www.youtube.com/playlist?list=PL123456');
      expect(info.type).toBe(ResourceType.YOUTUBE_PLAYLIST);
      expect(info.provider).toBe('YouTube');
      expect(info.externalId).toBe('PL123456');
    });

    it('should detect generic website URLs', () => {
      const info = urlDetector.detect('https://arxiv.org/abs/2301.00001');
      expect(info.type).toBe(ResourceType.WEBSITE);
      expect(info.provider).toBe('arXiv');
    });

    it('should prevent SSRF by blocking local/private IP addresses in metadata scraper', async () => {
      const metadata = await urlMetadataScraper.scrape('http://127.0.0.1/admin');
      expect(metadata.metadata?.ssrfBlocked).toBe(true);
      expect(metadata.title).toBe('admin');
    });

    it('should prevent SSRF by blocking localhost/internal hosts', async () => {
      const metadata = await urlMetadataScraper.scrape('http://localhost:8080/secret');
      expect(metadata.metadata?.ssrfBlocked).toBe(true);
    });
  });

  describe('FileValidatorService', () => {
    it('should validate allowed PDF file', () => {
      const validated = fileValidator.validateFile('notes.pdf', 'application/pdf', 1024 * 1024);
      expect(validated.type).toBe(ResourceType.PDF);
      expect(validated.sanitizedFilename).toBe('notes.pdf');
    });

    it('should detect code file types', () => {
      const validated = fileValidator.validateFile('script.py', 'text/x-python', 500);
      expect(validated.type).toBe(ResourceType.CODE);
    });

    it('should reject empty filenames', () => {
      expect(() => fileValidator.validateFile('', 'application/pdf', 100)).toThrow(BadRequestException);
    });

    it('should sanitize path traversal attempts in filenames', () => {
      const validated = fileValidator.validateFile('../../../etc/passwd.pdf', 'application/pdf', 100);
      expect(validated.sanitizedFilename).toBe('passwd.pdf');
    });

    it('should reject files exceeding max size (50MB)', () => {
      expect(() => fileValidator.validateFile('large.pdf', 'application/pdf', 60 * 1024 * 1024)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('createUrlResource', () => {
    it('should create a YouTube video resource in INBOX by default', async () => {
      jest.spyOn(urlMetadataScraper, 'scrape').mockResolvedValue({
        url: 'https://youtube.com/watch?v=12345',
        type: ResourceType.YOUTUBE_VIDEO,
        title: 'Bayes Theorem Video',
        description: 'Learn Bayes Theorem',
        thumbnailUrl: 'https://img.youtube.com/vi/12345/hqdefault.jpg',
        provider: 'YouTube',
        externalId: '12345',
        domain: 'youtube.com',
        metadata: {},
      });
      db.resource.create.mockResolvedValue(mockResource);

      const result = await service.createUrlResource(mockUser.id, {
        url: 'https://youtube.com/watch?v=12345',
        title: 'Bayes Theorem Video',
      });

      expect(db.resource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            locationType: ResourceLocationType.INBOX,
            type: ResourceType.YOUTUBE_VIDEO,
            url: 'https://youtube.com/watch?v=12345',
          }),
        }),
      );
      expect(result.id).toBe('res-1');
      expect(result.title).toBe('Bayes Theorem Video');
    });
  });

  describe('createFileResource', () => {
    it('should validate and upload file, then save resource', async () => {
      const fileBuffer = Buffer.from('PDF data content');
      const mockFileResource = {
        ...mockResource,
        id: 'res-pdf',
        type: ResourceType.PDF,
        filename: 'gate_pyqs.pdf',
        mimeType: 'application/pdf',
        sizeBytes: fileBuffer.length,
        storageKey: 'mock-storage-key',
      };
      db.resource.create.mockResolvedValue(mockFileResource);

      const result = await service.createFileResource(mockUser.id, fileBuffer, 'gate_pyqs.pdf', 'application/pdf', {
        title: 'GATE / UGC / UPSC PYQs',
      });

      expect(storage.upload).toHaveBeenCalledWith(fileBuffer, 'gate_pyqs.pdf', 'application/pdf');
      expect(db.resource.create).toHaveBeenCalled();
      expect(result.id).toBe('res-pdf');
      expect(result.filename).toBe('gate_pyqs.pdf');
    });
  });

  describe('presigned upload workflow', () => {
    it('should return presigned URL from storage provider', async () => {
      const presign = await service.getPresignedUpload(mockUser.id, {
        filename: 'large_lecture.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 10 * 1024 * 1024,
      });

      expect(presign.uploadUrl).toBe('https://s3.amazonaws.com/presigned-upload');
      expect(presign.storageKey).toBe('presigned-key');
    });

    it('should complete presigned upload record', async () => {
      const mockCompleted = {
        ...mockResource,
        id: 'res-presigned',
        storageKey: 'presigned-key',
      };
      db.resource.create.mockResolvedValue(mockCompleted);

      const result = await service.completePresignedUpload(mockUser.id, {
        storageKey: 'presigned-key',
        filename: 'notes.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2048,
        title: 'Presigned Notes',
      });

      expect(db.resource.create).toHaveBeenCalled();
      expect(result.id).toBe('res-presigned');
    });
  });

  describe('getResources & Inbox', () => {
    it('should fetch user resources with filters', async () => {
      db.resource.findMany.mockResolvedValue([mockResource]);
      db.resource.count.mockResolvedValue(1);

      const response = await service.getResources(mockUser.id, {
        search: 'Bayes',
        type: ResourceType.YOUTUBE_VIDEO,
      });

      expect(db.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            type: ResourceType.YOUTUBE_VIDEO,
          }),
        }),
      );
      expect(response.items).toHaveLength(1);
      expect(response.total).toBe(1);
    });

    it('should fetch inbox resources (unassigned items)', async () => {
      db.resource.findMany.mockResolvedValue([mockResource]);

      const items = await service.getInbox(mockUser.id);
      expect(db.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-1',
            locationType: ResourceLocationType.INBOX,
          },
        }),
      );
      expect(items).toHaveLength(1);
    });
  });

  describe('ownership & authorization', () => {
    it('should throw NotFoundException when getting resource belonging to another user', async () => {
      db.resource.findFirst.mockResolvedValue(null);

      await expect(service.getResourceById(mockUser2.id, 'res-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if assigning resource to non-existent or foreign topic', async () => {
      db.resource.findFirst.mockResolvedValue(mockResource);
      db.topic.findFirst.mockResolvedValue(null);

      await expect(
        service.assignResource(mockUser.id, 'res-1', {
          locationType: ResourceLocationType.TOPIC,
          topicId: 'foreign-topic-id',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assigning & moving resources', () => {
    it('should resolve topic parent hierarchy (chapter, subject, exam) when assigning to topic', async () => {
      db.resource.findFirst.mockResolvedValue(mockResource);
      db.topic.findFirst.mockResolvedValue({
        id: 'topic-1',
        name: 'Bayes Theorem',
        chapterId: 'chap-1',
        chapter: {
          id: 'chap-1',
          subjectId: 'sub-1',
          subject: {
            id: 'sub-1',
            examId: 'exam-1',
          },
        },
      });

      db.resource.update.mockResolvedValue({
        ...mockResource,
        locationType: ResourceLocationType.TOPIC,
        topicId: 'topic-1',
        chapterId: 'chap-1',
        subjectId: 'sub-1',
        examId: 'exam-1',
      });

      const updated = await service.assignResource(mockUser.id, 'res-1', {
        locationType: ResourceLocationType.TOPIC,
        topicId: 'topic-1',
      });

      expect(db.resource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-1' },
          data: expect.objectContaining({
            locationType: ResourceLocationType.TOPIC,
            topicId: 'topic-1',
            chapterId: 'chap-1',
            subjectId: 'sub-1',
            examId: 'exam-1',
          }),
        }),
      );
      expect(updated.locationType).toBe(ResourceLocationType.TOPIC);
      expect(updated.topicId).toBe('topic-1');
    });
  });

  describe('deleteResource', () => {
    it('should delete storage file and database record', async () => {
      const fileRes = {
        ...mockResource,
        storageKey: 'file-to-delete.pdf',
      };
      db.resource.findFirst.mockResolvedValue(fileRes);
      db.resource.delete.mockResolvedValue(fileRes);

      const result = await service.deleteResource(mockUser.id, 'res-1');

      expect(storage.delete).toHaveBeenCalledWith('file-to-delete.pdf');
      expect(db.resource.delete).toHaveBeenCalledWith({ where: { id: 'res-1' } });
      expect(result.success).toBe(true);
    });
  });
});
