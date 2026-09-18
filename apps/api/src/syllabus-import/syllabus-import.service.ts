import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { STORAGE_PROVIDER, StorageProvider } from '../storage/storage.interface';
import { AI_PROVIDER, AIProvider } from '../ai/ai.interface';
import { DocumentParserService } from '../document-parser/document-parser.service';
import {
  ApproveSyllabusImportDto,
  DocumentResponse,
  DocumentProcessingStatus,
  SyllabusDocumentType,
  ProgressStatus,
} from '@studyos/shared';

@Injectable()
export class SyllabusImportService {
  private readonly logger = new Logger(SyllabusImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
    private readonly documentParser: DocumentParserService,
  ) {}

  async uploadAndProcess(
    userId: string,
    file: Express.Multer.File,
    examId?: string,
  ): Promise<DocumentResponse> {
    if (!file) {
      throw new BadRequestException('No PDF file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }

    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds maximum limit of 25MB');
    }

    if (examId) {
      const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
      if (!exam || exam.userId !== userId) {
        throw new ForbiddenException('Access denied to specified exam');
      }
    }

    // 1. Upload file to Object Storage
    const { storageKey } = await this.storageProvider.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // 2. Create processing record in DB
    const doc = await this.prisma.document.create({
      data: {
        userId,
        examId: examId || null,
        filename: file.originalname,
        mimeType: file.mimetype,
        storageKey,
        sizeBytes: file.size,
        status: DocumentProcessingStatus.PROCESSING,
      },
    });

    try {
      // 3. Extract text from PDF
      const parseResult = await this.documentParser.parsePdf(file.buffer);

      if (parseResult.isScannedOrEmpty) {
        const failedDoc = await this.prisma.document.update({
          where: { id: doc.id },
          data: {
            status: DocumentProcessingStatus.FAILED,
            errorMessage: 'Scanned/Image PDF detected. Text extraction requires OCR.',
          },
        });
        return this.mapToResponse(failedDoc);
      }

      await this.prisma.document.update({
        where: { id: doc.id },
        data: {
          extractedText: parseResult.text.slice(0, 100000), // capped text storage
          status: DocumentProcessingStatus.EXTRACTED,
        },
      });

      // 4. AI Structure Analysis & Classification
      const hierarchy = await this.aiProvider.analyzeSyllabusText(parseResult.text);

      const updatedDoc = await this.prisma.document.update({
        where: { id: doc.id },
        data: {
          status: DocumentProcessingStatus.READY_FOR_REVIEW,
          documentType: hierarchy.documentType as SyllabusDocumentType,
          aiConfidence: hierarchy.confidence,
          extractedHierarchy: hierarchy as any,
          warnings: hierarchy.warnings as any,
        },
      });

      return this.mapToResponse(updatedDoc);
    } catch (err: any) {
      this.logger.error(`Processing document failed for ${doc.id}`, err);
      const failedDoc = await this.prisma.document.update({
        where: { id: doc.id },
        data: {
          status: DocumentProcessingStatus.FAILED,
          errorMessage: err.message || 'Failed to process document',
        },
      });
      return this.mapToResponse(failedDoc);
    }
  }

  async getDocument(userId: string, documentId: string): Promise<DocumentResponse> {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    if (doc.userId !== userId) {
      throw new ForbiddenException('Access denied to this document');
    }

    return this.mapToResponse(doc);
  }

  async approveImport(
    userId: string,
    documentId: string,
    dto: ApproveSyllabusImportDto,
  ): Promise<{ success: boolean; examId: string }> {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    if (doc.userId !== userId) {
      throw new ForbiddenException('Access denied to this document');
    }

    if (
      doc.status !== DocumentProcessingStatus.READY_FOR_REVIEW &&
      doc.status !== DocumentProcessingStatus.ANALYZED
    ) {
      throw new BadRequestException(`Document cannot be approved in status: ${doc.status}`);
    }

    // Wrap full hierarchy creation inside a Prisma transaction
    const targetExamId = await this.prisma.$transaction(async (tx) => {
      let examId = dto.targetExamId || doc.examId;

      if (examId) {
        const existingExam = await tx.exam.findUnique({ where: { id: examId } });
        if (!existingExam || existingExam.userId !== userId) {
          throw new ForbiddenException('Access denied to target exam');
        }
      } else {
        const title = dto.examTitle || (doc.extractedHierarchy as any)?.title || doc.filename.replace(/\.pdf$/i, '');
        const newExam = await tx.exam.create({
          data: {
            userId,
            title,
            dailyGoalHours: 4.0,
          },
        });
        examId = newExam.id;
      }

      // Create Subjects, Chapters, Topics, Subtopics
      for (let sIdx = 0; sIdx < dto.subjects.length; sIdx++) {
        const subDto = dto.subjects[sIdx];
        const subject = await tx.subject.create({
          data: {
            examId: examId!,
            userId,
            name: subDto.name,
            code: subDto.code,
            orderIndex: sIdx,
          },
        });

        for (let cIdx = 0; cIdx < subDto.chapters.length; cIdx++) {
          const chapDto = subDto.chapters[cIdx];
          const chapter = await tx.chapter.create({
            data: {
              subjectId: subject.id,
              userId,
              name: chapDto.name,
              orderIndex: cIdx,
            },
          });

          for (let tIdx = 0; tIdx < chapDto.topics.length; tIdx++) {
            const topDto = chapDto.topics[tIdx];
            const rootTopic = await tx.topic.create({
              data: {
                chapterId: chapter.id,
                userId,
                name: topDto.name,
                orderIndex: tIdx,
                progress: {
                  create: {
                    userId,
                    status: ProgressStatus.NOT_STARTED,
                    confidenceScore: 1,
                  },
                },
              },
            });

            if (topDto.subtopics && topDto.subtopics.length > 0) {
              for (let stIdx = 0; stIdx < topDto.subtopics.length; stIdx++) {
                const subtopDto = topDto.subtopics[stIdx];
                await tx.topic.create({
                  data: {
                    chapterId: chapter.id,
                    userId,
                    parentId: rootTopic.id,
                    name: subtopDto.name,
                    orderIndex: stIdx,
                    progress: {
                      create: {
                        userId,
                        status: ProgressStatus.NOT_STARTED,
                        confidenceScore: 1,
                      },
                    },
                  },
                });
              }
            }
          }
        }
      }

      // Mark Document status APPROVED
      await tx.document.update({
        where: { id: documentId },
        data: {
          status: DocumentProcessingStatus.APPROVED,
          examId,
        },
      });

      return examId!;
    });

    return { success: true, examId: targetExamId };
  }

  private mapToResponse(doc: any): DocumentResponse {
    return {
      id: doc.id,
      userId: doc.userId,
      examId: doc.examId,
      filename: doc.filename,
      mimeType: doc.mimeType,
      storageKey: doc.storageKey,
      sizeBytes: doc.sizeBytes,
      status: doc.status as DocumentProcessingStatus,
      documentType: doc.documentType as SyllabusDocumentType | null,
      aiConfidence: doc.aiConfidence,
      extractedHierarchy: doc.extractedHierarchy as any,
      warnings: doc.warnings as any,
      errorMessage: doc.errorMessage,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
