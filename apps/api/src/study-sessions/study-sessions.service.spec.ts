import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { PrismaService } from '../database/prisma.service';
import { SessionStatus, SessionType, ProgressStatus } from '@studyos/shared';

describe('StudySessionsService', () => {
  let service: StudySessionsService;
  let prisma: any;

  const mockUserId = 'user-1';
  const mockOtherUserId = 'user-2';
  const mockTopicId = 'topic-1';
  const mockChapterId = 'chapter-1';
  const mockSubjectId = 'subject-1';
  const mockExamId = 'exam-1';
  const mockSessionId = 'session-1';

  const mockTopic = {
    id: mockTopicId,
    name: 'Bayes Theorem',
    userId: mockUserId,
    chapterId: mockChapterId,
    chapter: {
      id: mockChapterId,
      name: 'Probability',
      subject: {
        id: mockSubjectId,
        name: 'Probability & Statistics',
        examId: mockExamId,
      },
    },
  };

  const mockSession = {
    id: mockSessionId,
    userId: mockUserId,
    topicId: mockTopicId,
    chapterId: mockChapterId,
    subjectId: mockSubjectId,
    examId: mockExamId,
    sessionType: SessionType.LEARNING,
    status: SessionStatus.CREATED,
    startedAt: null,
    endedAt: null,
    lastPausedAt: null,
    totalPauseSeconds: 0,
    durationSeconds: 0,
    goal: 'Master Bayes Theorem',
    createdAt: new Date(),
    updatedAt: new Date(),
    topic: { id: mockTopicId, name: 'Bayes Theorem' },
    chapter: { id: mockChapterId, name: 'Probability' },
    subject: { id: mockSubjectId, name: 'Probability & Statistics' },
    exam: { id: mockExamId, title: 'GATE DA' },
  };

  beforeEach(async () => {
    prisma = {
      studySession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      topic: {
        findUnique: jest.fn(),
      },
      topicProgress: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((promises) => Promise.all(promises)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudySessionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<StudySessionsService>(StudySessionsService);
  });

  describe('createSession', () => {
    it('should create a new study session successfully', async () => {
      prisma.studySession.findFirst.mockResolvedValue(null);
      prisma.topic.findUnique.mockResolvedValue(mockTopic);
      prisma.studySession.create.mockResolvedValue(mockSession);

      const result = await service.createSession(mockUserId, {
        topicId: mockTopicId,
        sessionType: SessionType.LEARNING,
        goal: 'Master Bayes Theorem',
      });

      expect(result.id).toEqual(mockSessionId);
      expect(result.status).toEqual(SessionStatus.CREATED);
      expect(prisma.studySession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUserId,
          topicId: mockTopicId,
          chapterId: mockChapterId,
          subjectId: mockSubjectId,
          examId: mockExamId,
          sessionType: SessionType.LEARNING,
        }),
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException if user already has an active session', async () => {
      prisma.studySession.findFirst.mockResolvedValue({
        ...mockSession,
        status: SessionStatus.ACTIVE,
      });

      await expect(
        service.createSession(mockUserId, { topicId: mockTopicId }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if topic does not exist or belong to user', async () => {
      prisma.studySession.findFirst.mockResolvedValue(null);
      prisma.topic.findUnique.mockResolvedValue(null);

      await expect(
        service.createSession(mockUserId, { topicId: 'invalid-topic' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('State Machine & Transitions', () => {
    it('should start a session (CREATED -> ACTIVE)', async () => {
      prisma.studySession.findUnique.mockResolvedValue(mockSession);
      prisma.studySession.findFirst.mockResolvedValue(null);
      const now = new Date();
      prisma.studySession.update.mockResolvedValue({
        ...mockSession,
        status: SessionStatus.ACTIVE,
        startedAt: now,
      });

      const res = await service.startSession(mockUserId, mockSessionId);
      expect(res.status).toEqual(SessionStatus.ACTIVE);
      expect(res.startedAt).toBeDefined();
    });

    it('should pause an active session (ACTIVE -> PAUSED)', async () => {
      const activeSession = {
        ...mockSession,
        status: SessionStatus.ACTIVE,
        startedAt: new Date(),
      };
      prisma.studySession.findUnique.mockResolvedValue(activeSession);
      prisma.studySession.update.mockResolvedValue({
        ...activeSession,
        status: SessionStatus.PAUSED,
        lastPausedAt: new Date(),
      });

      const res = await service.pauseSession(mockUserId, mockSessionId);
      expect(res.status).toEqual(SessionStatus.PAUSED);
      expect(res.lastPausedAt).toBeDefined();
    });

    it('should resume a paused session (PAUSED -> ACTIVE) and aggregate pause seconds', async () => {
      const pausedAt = new Date(Date.now() - 15000); // Paused 15s ago
      const pausedSession = {
        ...mockSession,
        status: SessionStatus.PAUSED,
        startedAt: new Date(Date.now() - 60000),
        lastPausedAt: pausedAt,
        totalPauseSeconds: 0,
      };

      prisma.studySession.findUnique.mockResolvedValue(pausedSession);
      prisma.studySession.update.mockResolvedValue({
        ...pausedSession,
        status: SessionStatus.ACTIVE,
        lastPausedAt: null,
        totalPauseSeconds: 15,
      });

      const res = await service.resumeSession(mockUserId, mockSessionId);
      expect(res.status).toEqual(SessionStatus.ACTIVE);
      expect(prisma.studySession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: SessionStatus.ACTIVE,
            lastPausedAt: null,
          }),
        }),
      );
    });

    it('should throw BadRequestException on invalid state transition (COMPLETED -> ACTIVE)', async () => {
      const completedSession = {
        ...mockSession,
        status: SessionStatus.COMPLETED,
      };
      prisma.studySession.findUnique.mockResolvedValue(completedSession);

      await expect(
        service.startSession(mockUserId, mockSessionId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should finish a session (ACTIVE -> COMPLETED) and update TopicProgress', async () => {
      const startedAt = new Date(Date.now() - 3000000); // 50 minutes ago
      const activeSession = {
        ...mockSession,
        status: SessionStatus.ACTIVE,
        startedAt,
        totalPauseSeconds: 0,
      };

      prisma.studySession.findUnique.mockResolvedValue(activeSession);
      prisma.studySession.update.mockResolvedValue({
        ...activeSession,
        status: SessionStatus.COMPLETED,
        durationSeconds: 3000,
        reflection: 'Understood proof of Bayes theorem',
        confidence: 4,
      });
      prisma.topicProgress.findUnique.mockResolvedValue(null);
      prisma.topicProgress.upsert.mockResolvedValue({
        id: 'prog-1',
        topicId: mockTopicId,
        status: ProgressStatus.COMPLETED,
      });

      const res = await service.finishSession(mockUserId, mockSessionId, {
        reflection: 'Understood proof of Bayes theorem',
        confidence: 4,
        markTopicCompleted: true,
      });

      expect(res.status).toEqual(SessionStatus.COMPLETED);
      expect(res.durationSeconds).toEqual(3000);
      expect(prisma.topicProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { topicId: mockTopicId },
          update: expect.objectContaining({
            status: ProgressStatus.COMPLETED,
          }),
        }),
      );
    });
  });

  describe('Daily Summary', () => {
    it('should calculate daily summary accurately', async () => {
      const today = new Date();
      prisma.studySession.findMany.mockResolvedValue([
        {
          id: 's1',
          durationSeconds: 1800,
          topicId: 't1',
          subject: { id: 'sub1', name: 'Math', colorHex: '#3B82F6' },
        },
        {
          id: 's2',
          durationSeconds: 1200,
          topicId: 't2',
          subject: { id: 'sub1', name: 'Math', colorHex: '#3B82F6' },
        },
      ]);
      prisma.topicProgress.count.mockResolvedValue(2);

      const summary = await service.getDailySummary(
        mockUserId,
        today.toISOString(),
        'UTC',
      );

      expect(summary.totalStudySeconds).toEqual(3000);
      expect(summary.sessionCount).toEqual(2);
      expect(summary.topicsStudiedCount).toEqual(2);
      expect(summary.topicsCompletedCount).toEqual(2);
      expect(summary.subjectsStudied.length).toEqual(1);
    });
  });
});
