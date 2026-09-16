import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { PrismaService } from '../database/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ExamsService', () => {
  let service: ExamsService;

  const mockPrismaService = {
    exam: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an exam bound to the current user', async () => {
      const dto = { title: 'GATE DA 2027', code: 'GATE_DA', dailyGoalHours: 4 };
      const createdExam = {
        id: 'exam-1',
        userId: 'user-1',
        title: dto.title,
        code: dto.code,
        targetDate: null,
        targetScore: null,
        targetRank: null,
        dailyGoalHours: 4,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.exam.create.mockResolvedValue(createdExam);

      const result = await service.create('user-1', dto);

      expect(mockPrismaService.exam.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          title: 'GATE DA 2027',
        }),
      });
      expect(result.id).toBe('exam-1');
      expect(result.userId).toBe('user-1');
    });
  });

  describe('findOne & user isolation', () => {
    it('should return exam if requested by owner user', async () => {
      const exam = {
        id: 'exam-1',
        userId: 'user-1',
        title: 'GATE DA',
        subjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.exam.findUnique.mockResolvedValue(exam);

      const result = await service.findOne('user-1', 'exam-1');
      expect(result.id).toBe('exam-1');
    });

    it('should throw ForbiddenException if accessed by a different user', async () => {
      const exam = {
        id: 'exam-1',
        userId: 'user-1',
        title: 'GATE DA',
        subjects: [],
      };

      mockPrismaService.exam.findUnique.mockResolvedValue(exam);

      await expect(service.findOne('user-2', 'exam-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if exam does not exist', async () => {
      mockPrismaService.exam.findUnique.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update & delete tenant isolation', () => {
    it('should throw ForbiddenException when updating an exam owned by another user', async () => {
      const exam = { id: 'exam-1', userId: 'user-1', title: 'GATE DA', subjects: [] };
      mockPrismaService.exam.findUnique.mockResolvedValue(exam);

      await expect(service.update('user-2', 'exam-1', { title: 'Hacked' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when deleting an exam owned by another user', async () => {
      const exam = { id: 'exam-1', userId: 'user-1', title: 'GATE DA', subjects: [] };
      mockPrismaService.exam.findUnique.mockResolvedValue(exam);

      await expect(service.remove('user-2', 'exam-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
