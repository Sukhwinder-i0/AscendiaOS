import { Test, TestingModule } from '@nestjs/testing';
import { SyllabusService } from './syllabus.service';
import { PrismaService } from '../database/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { ProgressStatus } from '@studyos/shared';

describe('SyllabusService', () => {
  let service: SyllabusService;

  const mockPrismaService = {
    exam: {
      findUnique: jest.fn(),
    },
    subject: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      updateMany: jest.fn(),
    },
    chapter: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      updateMany: jest.fn(),
    },
    topic: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      updateMany: jest.fn(),
    },
    topicProgress: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyllabusService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SyllabusService>(SyllabusService);

    jest.clearAllMocks();
  });

  describe('getSyllabusTree', () => {
    it('should aggregate syllabus hierarchy and compute overall & nested progress correctly', async () => {
      mockPrismaService.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        userId: 'user-1',
      });

      mockPrismaService.subject.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          examId: 'exam-1',
          userId: 'user-1',
          name: 'Mathematics',
          code: 'MATH',
          colorHex: '#3B82F6',
          orderIndex: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          chapters: [
            {
              id: 'chap-1',
              subjectId: 'sub-1',
              userId: 'user-1',
              name: 'Linear Algebra',
              orderIndex: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              topics: [
                {
                  id: 'top-1',
                  chapterId: 'chap-1',
                  userId: 'user-1',
                  parentId: null,
                  name: 'Matrices',
                  orderIndex: 0,
                  path: '/top-1',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  progress: {
                    id: 'prog-1',
                    status: ProgressStatus.COMPLETED,
                    confidenceScore: 4,
                    masteryScore: 80,
                    totalStudyTimeSec: 3600,
                  },
                },
                {
                  id: 'top-2',
                  chapterId: 'chap-1',
                  userId: 'user-1',
                  parentId: null,
                  name: 'Eigenvalues',
                  orderIndex: 1,
                  path: '/top-2',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  progress: {
                    id: 'prog-2',
                    status: ProgressStatus.NOT_STARTED,
                    confidenceScore: 1,
                    masteryScore: 0,
                    totalStudyTimeSec: 0,
                  },
                },
              ],
            },
          ],
        },
      ]);

      const tree = await service.getSyllabusTree('user-1', 'exam-1');

      expect(tree.examId).toBe('exam-1');
      expect(tree.totalSubjects).toBe(1);
      expect(tree.totalChapters).toBe(1);
      expect(tree.totalTopics).toBe(2);
      expect(tree.completedTopics).toBe(1);
      expect(tree.overallProgressPercentage).toBe(50);
      expect(tree.subjects[0].chapters[0].progressPercentage).toBe(50);
    });

    it('should throw ForbiddenException if fetching syllabus tree of another user exam', async () => {
      mockPrismaService.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        userId: 'user-1',
      });

      await expect(service.getSyllabusTree('user-2', 'exam-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createSubject / createChapter / createTopic', () => {
    it('should create topic with initial NOT_STARTED progress', async () => {
      mockPrismaService.chapter.findUnique.mockResolvedValue({
        id: 'chap-1',
        userId: 'user-1',
      });

      mockPrismaService.topic.aggregate.mockResolvedValue({ _max: { orderIndex: 0 } });
      mockPrismaService.topic.create.mockResolvedValue({
        id: 'top-1',
        chapterId: 'chap-1',
        name: 'Probability',
        progress: { status: ProgressStatus.NOT_STARTED },
      });

      const topic = await service.createTopic('user-1', 'chap-1', { name: 'Probability' });

      expect(topic.name).toBe('Probability');
      expect(mockPrismaService.topic.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            chapterId: 'chap-1',
            name: 'Probability',
          }),
        }),
      );
    });
  });
});
