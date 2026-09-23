import { Test, TestingModule } from '@nestjs/testing';
import { SyllabusImportService } from './syllabus-import.service';
import { PrismaService } from '../database/prisma.service';
import { STORAGE_PROVIDER } from '../storage/storage.interface';
import { AI_PROVIDER } from '../ai/ai.interface';
import { DocumentParserService } from '../document-parser/document-parser.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentProcessingStatus, SyllabusDocumentType } from '@ascendiaos/shared';

describe('SyllabusImportService', () => {
  let service: SyllabusImportService;

  const mockPrismaService = {
    document: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    exam: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    subject: {
      create: jest.fn().mockImplementation(({ data }) => ({ id: 'sub-1', ...data })),
    },
    chapter: {
      create: jest.fn().mockImplementation(({ data }) => ({ id: 'chap-1', ...data })),
    },
    topic: {
      create: jest.fn().mockImplementation(({ data }) => ({ id: 'top-1', ...data })),
    },
  };

  const mockStorageProvider = {
    upload: jest.fn().mockResolvedValue({ storageKey: 'test-key.pdf' }),
    get: jest.fn(),
    delete: jest.fn(),
  };

  const mockAIProvider = {
    analyzeSyllabusText: jest.fn(),
  };

  const mockDocumentParser = {
    parsePdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyllabusImportService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: STORAGE_PROVIDER, useValue: mockStorageProvider },
        { provide: AI_PROVIDER, useValue: mockAIProvider },
        { provide: DocumentParserService, useValue: mockDocumentParser },
      ],
    }).compile();

    service = module.get<SyllabusImportService>(SyllabusImportService);

    jest.clearAllMocks();
  });

  describe('uploadAndProcess', () => {
    const mockFile: any = {
      originalname: 'syllabus.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 50,
      buffer: Buffer.from('mock pdf content'),
    };

    it('should successfully upload, extract text, analyze hierarchy, and return ready document', async () => {
      mockPrismaService.document.create.mockResolvedValue({
        id: 'doc-1',
        userId: 'user-1',
        filename: mockFile.originalname,
        mimeType: mockFile.mimetype,
        storageKey: 'test-key.pdf',
        sizeBytes: mockFile.size,
        status: DocumentProcessingStatus.PROCESSING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockDocumentParser.parsePdf.mockResolvedValue({
        text: 'GATE / UGC / UPSC Syllabus Mathematics Probability',
        numPages: 2,
        pages: [],
        isScannedOrEmpty: false,
      });

      mockAIProvider.analyzeSyllabusText.mockResolvedValue({
        documentType: 'FULL_EXAM_SYLLABUS',
        confidence: 0.95,
        title: 'GATE / UGC / UPSC Syllabus',
        subjects: [
          {
            name: 'Mathematics',
            chapters: [{ name: 'Probability', topics: [{ name: 'Bayes Theorem' }] }],
          },
        ],
        warnings: [],
      });

      mockPrismaService.document.update.mockImplementation(({ data }) => ({
        id: 'doc-1',
        userId: 'user-1',
        filename: mockFile.originalname,
        mimeType: mockFile.mimetype,
        storageKey: 'test-key.pdf',
        sizeBytes: mockFile.size,
        status: data.status,
        documentType: data.documentType,
        aiConfidence: data.aiConfidence,
        extractedHierarchy: data.extractedHierarchy,
        warnings: data.warnings,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const res = await service.uploadAndProcess('user-1', mockFile);

      expect(mockStorageProvider.upload).toHaveBeenCalled();
      expect(mockDocumentParser.parsePdf).toHaveBeenCalled();
      expect(mockAIProvider.analyzeSyllabusText).toHaveBeenCalled();
      expect(res.status).toBe(DocumentProcessingStatus.READY_FOR_REVIEW);
      expect(res.documentType).toBe(SyllabusDocumentType.FULL_EXAM_SYLLABUS);
    });

    it('should set status FAILED if PDF is scanned or contains negligible text', async () => {
      mockPrismaService.document.create.mockResolvedValue({
        id: 'doc-2',
        userId: 'user-1',
        filename: mockFile.originalname,
        status: DocumentProcessingStatus.PROCESSING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockDocumentParser.parsePdf.mockResolvedValue({
        text: 'Short',
        numPages: 1,
        pages: [],
        isScannedOrEmpty: true,
      });

      mockPrismaService.document.update.mockImplementation(({ data }) => ({
        id: 'doc-2',
        userId: 'user-1',
        status: data.status,
        errorMessage: data.errorMessage,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const res = await service.uploadAndProcess('user-1', mockFile);

      expect(res.status).toBe(DocumentProcessingStatus.FAILED);
      expect(res.errorMessage).toContain('Scanned/Image PDF detected');
    });

    it('should throw BadRequestException if file is not PDF', async () => {
      const invalidFile: any = { ...mockFile, mimetype: 'image/png' };
      await expect(service.uploadAndProcess('user-1', invalidFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDocument & tenant isolation', () => {
    it('should return document if requested by owner', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        userId: 'user-1',
        filename: 'syllabus.pdf',
        status: DocumentProcessingStatus.READY_FOR_REVIEW,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.getDocument('user-1', 'doc-1');
      expect(res.id).toBe('doc-1');
    });

    it('should throw ForbiddenException if requested by another user', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        userId: 'user-1',
      });

      await expect(service.getDocument('user-2', 'doc-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('approveImport', () => {
    it('should create hierarchy in transaction and mark document APPROVED', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        userId: 'user-1',
        status: DocumentProcessingStatus.READY_FOR_REVIEW,
      });

      mockPrismaService.exam.create.mockResolvedValue({
        id: 'exam-new-1',
        userId: 'user-1',
        title: 'GATE / UGC / UPSC 2027',
      });

      const dto = {
        examTitle: 'GATE / UGC / UPSC 2027',
        subjects: [
          {
            name: 'Linear Algebra',
            chapters: [
              {
                name: 'Matrices',
                topics: [{ name: 'Determinants', subtopics: [{ name: 'Cramer Rule' }] }],
              },
            ],
          },
        ],
      };

      const result = await service.approveImport('user-1', 'doc-1', dto);

      expect(result.success).toBe(true);
      expect(result.examId).toBe('exam-new-1');
      expect(mockPrismaService.subject.create).toHaveBeenCalled();
      expect(mockPrismaService.chapter.create).toHaveBeenCalled();
      expect(mockPrismaService.topic.create).toHaveBeenCalledTimes(2); // 1 topic + 1 subtopic
      expect(mockPrismaService.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'doc-1' },
          data: expect.objectContaining({ status: DocumentProcessingStatus.APPROVED }),
        }),
      );
    });

    it('should throw ForbiddenException if user tries to approve another user document', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        userId: 'user-1',
        status: DocumentProcessingStatus.READY_FOR_REVIEW,
      });

      await expect(service.approveImport('user-2', 'doc-1', { subjects: [] })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
