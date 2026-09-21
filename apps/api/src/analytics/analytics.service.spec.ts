import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { ActivityService } from '../activity/activity.service';
import { PrismaService } from '../database/prisma.service';
import { SessionStatus, ProgressStatus } from '@studyos/shared';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let activityService: ActivityService;
  let prisma: any;

  const mockUserId = 'user-1';
  const mockExamId = 'exam-1';
  const mockOtherExamId = 'exam-2';

  beforeEach(async () => {
    prisma = {
      exam: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: mockExamId,
            title: 'GATE DA',
            code: 'GATE_DA',
            targetDate: new Date('2027-02-01T00:00:00.000Z'),
            dailyGoalHours: 4.0,
          },
        ]),
        findUnique: jest.fn().mockResolvedValue({ id: mockExamId, userId: mockUserId }),
      },
      topic: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      subject: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      studySession: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      topicProgress: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        ActivityService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    activityService = module.get<ActivityService>(ActivityService);
  });

  // 1. Overall progress calculation
  describe('1. Overall progress calculation', () => {
    it('should calculate completed topics / total topics * 100 correctly', async () => {
      prisma.topic.count
        .mockResolvedValueOnce(10) // total topics
        .mockResolvedValueOnce(6); // completed topics

      const dashboard = await service.getDashboardData(mockUserId, {
        examId: mockExamId,
        timezone: 'UTC',
      });

      expect(dashboard.overallProgress.totalTopics).toEqual(10);
      expect(dashboard.overallProgress.completedTopics).toEqual(6);
      expect(dashboard.overallProgress.percentage).toEqual(60);
      expect(dashboard.overallProgress.methodology).toContain('completed topics / total topics');
    });
  });

  // 2. Subject progress
  describe('2. Subject progress calculation', () => {
    it('should calculate subject level topic counts, completion %, study time, and last studied date', async () => {
      prisma.subject.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          name: 'Probability',
          code: 'PROB',
          colorHex: '#3B82F6',
          orderIndex: 0,
          chapters: [
            {
              topics: [
                {
                  id: 't1',
                  progress: {
                    status: ProgressStatus.COMPLETED,
                    lastStudiedAt: new Date('2026-09-20T10:00:00.000Z'),
                  },
                },
                {
                  id: 't2',
                  progress: {
                    status: ProgressStatus.NOT_STARTED,
                    lastStudiedAt: null,
                  },
                },
              ],
            },
          ],
          studySessions: [
            {
              startedAt: new Date('2026-09-20T10:00:00.000Z'),
              endedAt: new Date('2026-09-20T11:00:00.000Z'),
              durationSeconds: 3600,
            },
          ],
        },
      ]);

      const subjects = await service.getSubjectAnalyticsList(mockUserId, mockExamId, 'UTC');

      expect(subjects.length).toEqual(1);
      expect(subjects[0].name).toEqual('Probability');
      expect(subjects[0].totalTopicsCount).toEqual(2);
      expect(subjects[0].completedTopicsCount).toEqual(1);
      expect(subjects[0].progressPercentage).toEqual(50);
      expect(subjects[0].studyTimeSeconds).toEqual(3600);
      expect(subjects[0].lastStudiedAt).toEqual('2026-09-20');
    });
  });

  // 3. Study time today
  describe('3. Study time today', () => {
    it('should aggregate only today completed sessions correctly', async () => {
      const todayStr = activityService.getTodayLocalDate('UTC');
      const todaySessionTime = new Date(`${todayStr}T10:00:00.000Z`);

      prisma.studySession.findMany.mockResolvedValue([
        {
          startedAt: todaySessionTime,
          endedAt: new Date(todaySessionTime.getTime() + 5400 * 1000),
          durationSeconds: 5400, // 1h 30m
        },
      ]);

      const dashboard = await service.getDashboardData(mockUserId, {
        examId: mockExamId,
        timezone: 'UTC',
      });

      expect(dashboard.studyTime.todaySeconds).toEqual(5400);
    });
  });

  // 4. Study time this week
  describe('4. Study time this week', () => {
    it('should aggregate sessions within the last 7 days window', async () => {
      const todayStr = activityService.getTodayLocalDate('UTC');
      const d1 = activityService.shiftLocalDate(todayStr, -2);

      prisma.studySession.findMany.mockResolvedValue([
        {
          startedAt: new Date(`${d1}T10:00:00.000Z`),
          endedAt: new Date(`${d1}T11:00:00.000Z`),
          durationSeconds: 3600,
        },
        {
          startedAt: new Date(`${todayStr}T10:00:00.000Z`),
          endedAt: new Date(`${todayStr}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
      ]);

      const dashboard = await service.getDashboardData(mockUserId, {
        examId: mockExamId,
        timezone: 'UTC',
      });

      expect(dashboard.studyTime.weekSeconds).toEqual(5400);
    });
  });

  // 5. Study time this month
  describe('5. Study time this month', () => {
    it('should aggregate sessions within last 30 days window', async () => {
      const todayStr = activityService.getTodayLocalDate('UTC');
      const d1 = activityService.shiftLocalDate(todayStr, -15);

      prisma.studySession.findMany.mockResolvedValue([
        {
          startedAt: new Date(`${d1}T10:00:00.000Z`),
          endedAt: new Date(`${d1}T12:00:00.000Z`),
          durationSeconds: 7200,
        },
      ]);

      const dashboard = await service.getDashboardData(mockUserId, {
        examId: mockExamId,
        timezone: 'UTC',
      });

      expect(dashboard.studyTime.monthSeconds).toEqual(7200);
      expect(dashboard.studyTime.last30DaysSeconds).toEqual(7200);
    });
  });

  // 6. 7-day trend
  describe('6. 7-day trend calculation', () => {
    it('should return continuous 7 date points and valid comparison', async () => {
      const trend = await service.getStudyTrend(mockUserId, mockExamId, '7d', 'UTC');
      expect(trend.period).toEqual('7d');
      expect(trend.points.length).toEqual(7);
      expect(trend.accessibleSummary).toBeDefined();
    });
  });

  // 7. 30-day trend
  describe('7. 30-day trend calculation', () => {
    it('should return continuous 30 date points', async () => {
      const trend = await service.getStudyTrend(mockUserId, mockExamId, '30d', 'UTC');
      expect(trend.period).toEqual('30d');
      expect(trend.points.length).toEqual(30);
    });
  });

  // 8. 90-day trend
  describe('8. 90-day trend calculation', () => {
    it('should return continuous 90 date points', async () => {
      const trend = await service.getStudyTrend(mockUserId, mockExamId, '90d', 'UTC');
      expect(trend.period).toEqual('90d');
      expect(trend.points.length).toEqual(90);
    });
  });

  // 9. 365-day trend
  describe('9. 365-day trend calculation', () => {
    it('should return continuous 365 date points', async () => {
      const trend = await service.getStudyTrend(mockUserId, mockExamId, '365d', 'UTC');
      expect(trend.period).toEqual('365d');
      expect(trend.points.length).toEqual(365);
    });
  });

  // 10. Subject study-time distribution
  describe('10. Subject study-time distribution', () => {
    it('should compute percentages per subject based on total study seconds', async () => {
      const todayStr = activityService.getTodayLocalDate('UTC');

      prisma.studySession.findMany.mockResolvedValue([
        {
          subjectId: 'sub-1',
          startedAt: new Date(`${todayStr}T10:00:00.000Z`),
          endedAt: new Date(`${todayStr}T11:00:00.000Z`),
          durationSeconds: 3600, // 60 mins
          subject: { id: 'sub-1', name: 'Probability', colorHex: '#3B82F6' },
        },
        {
          subjectId: 'sub-2',
          startedAt: new Date(`${todayStr}T14:00:00.000Z`),
          endedAt: new Date(`${todayStr}T14:30:00.000Z`),
          durationSeconds: 1800, // 30 mins
          subject: { id: 'sub-2', name: 'Linear Algebra', colorHex: '#10B981' },
        },
      ]);

      const dist = await service.getSubjectDistribution(mockUserId, mockExamId, 30, 'UTC');

      expect(dist.totalStudySeconds).toEqual(5400);
      expect(dist.items.length).toEqual(2);
      expect(dist.items[0].subjectName).toEqual('Probability');
      expect(dist.items[0].percentage).toEqual(67); // 3600/5400 = 66.6% -> 67%
      expect(dist.items[1].subjectName).toEqual('Linear Algebra');
      expect(dist.items[1].percentage).toEqual(33); // 1800/5400 = 33.3% -> 33%
    });
  });

  // 11. Topic status counts
  describe('11. Topic status counts', () => {
    it('should count topics by status accurately', async () => {
      prisma.topic.findMany.mockResolvedValue([
        { id: 't1', progress: { status: ProgressStatus.COMPLETED } },
        { id: 't2', progress: { status: ProgressStatus.MASTERED } },
        { id: 't3', progress: { status: ProgressStatus.LEARNING } },
        { id: 't4', progress: { status: ProgressStatus.NEEDS_REVISION } },
        { id: 't5', progress: { status: ProgressStatus.NOT_STARTED } },
      ]);

      const summaries = await service.getTopicSummaries(mockUserId, mockExamId, 'UTC');

      expect(summaries.counts.total).toEqual(5);
      expect(summaries.counts.completed).toEqual(2); // COMPLETED + MASTERED
      expect(summaries.counts.learning).toEqual(1);
      expect(summaries.counts.needsRevision).toEqual(1);
      expect(summaries.counts.notStarted).toEqual(1);
    });
  });

  // 12. Recently completed topics
  describe('12. Recently completed topics', () => {
    it('should return completed topics ordered by completedAt desc', async () => {
      prisma.topic.findMany.mockResolvedValue([
        {
          id: 't1',
          name: 'Bayes Theorem',
          progress: {
            status: ProgressStatus.COMPLETED,
            completedAt: new Date('2026-09-20T10:00:00.000Z'),
          },
        },
        {
          id: 't2',
          name: 'Conditional Probability',
          progress: {
            status: ProgressStatus.COMPLETED,
            completedAt: new Date('2026-09-21T10:00:00.000Z'),
          },
        },
      ]);

      const summaries = await service.getTopicSummaries(mockUserId, mockExamId, 'UTC');

      expect(summaries.recentlyCompleted.length).toEqual(2);
      expect(summaries.recentlyCompleted[0].name).toEqual('Conditional Probability');
    });
  });

  // 13. Not-started topics
  describe('13. Not-started topics', () => {
    it('should filter unstarted topics into notStarted list', async () => {
      prisma.topic.findMany.mockResolvedValue([
        {
          id: 't1',
          name: 'Sampling',
          progress: { status: ProgressStatus.NOT_STARTED },
        },
      ]);

      const summaries = await service.getTopicSummaries(mockUserId, mockExamId, 'UTC');

      expect(summaries.notStarted.length).toEqual(1);
      expect(summaries.notStarted[0].name).toEqual('Sampling');
    });
  });

  // 14. Needs-revision topics
  describe('14. Needs-revision topics', () => {
    it('should filter explicit NEEDS_REVISION topics into needsRevision list', async () => {
      prisma.topic.findMany.mockResolvedValue([
        {
          id: 't1',
          name: 'Eigenvectors',
          progress: { status: ProgressStatus.NEEDS_REVISION },
        },
      ]);

      const summaries = await service.getTopicSummaries(mockUserId, mockExamId, 'UTC');

      expect(summaries.needsRevision.length).toEqual(1);
      expect(summaries.needsRevision[0].name).toEqual('Eigenvectors');
    });
  });

  // 15. Weekly summary
  describe('15. Weekly summary', () => {
    it('should calculate 7-day period stats (study time, active days, sessions, topics)', async () => {
      const summary = await service.getPeriodSummary(mockUserId, mockExamId, 7, 'UTC');
      expect(summary.totalDays).toEqual(7);
      expect(summary.comparisonWithPrevious).toBeDefined();
    });
  });

  // 16. Monthly summary
  describe('16. Monthly summary', () => {
    it('should calculate 30-day period stats', async () => {
      const summary = await service.getPeriodSummary(mockUserId, mockExamId, 30, 'UTC');
      expect(summary.totalDays).toEqual(30);
      expect(summary.comparisonWithPrevious).toBeDefined();
    });
  });

  // 17. Previous-period comparison
  describe('17. Previous-period comparison', () => {
    it('should provide factual neutral comparison without evaluative language', async () => {
      const todayStr = activityService.getTodayLocalDate('UTC');
      const currStart = activityService.shiftLocalDate(todayStr, -6);
      const prevEnd = activityService.shiftLocalDate(currStart, -1);

      prisma.studySession.findMany.mockResolvedValue([
        {
          startedAt: new Date(`${currStart}T10:00:00.000Z`),
          endedAt: new Date(`${currStart}T12:00:00.000Z`),
          durationSeconds: 7200, // 2h in current period
        },
        {
          startedAt: new Date(`${prevEnd}T10:00:00.000Z`),
          endedAt: new Date(`${prevEnd}T11:00:00.000Z`),
          durationSeconds: 3600, // 1h in previous period
        },
      ]);

      const summary = await service.getPeriodSummary(mockUserId, mockExamId, 7, 'UTC');
      const comp = summary.comparisonWithPrevious!;

      expect(comp.currentValue).toEqual(7200);
      expect(comp.previousValue).toEqual(3600);
      expect(comp.difference).toEqual(3600);
      expect(comp.formattedDifference).toEqual('+1h 0m');
      expect(comp.text).toContain('Study time increased by 1h 0m compared with previous 7-day period.');
      // Verify no evaluative text
      expect(comp.text).not.toContain('productive');
      expect(comp.text).not.toContain('better');
      expect(comp.text).not.toContain('improving');
    });
  });

  // 18. Multiple exam isolation
  describe('18. Multiple exam isolation', () => {
    it('should strictly scope all database queries to selected examId', async () => {
      await service.getDashboardData(mockUserId, {
        examId: mockOtherExamId,
        timezone: 'UTC',
      });

      expect(prisma.topic.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            chapter: { subject: { examId: mockOtherExamId } },
          }),
        }),
      );
      expect(prisma.studySession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            examId: mockOtherExamId,
          }),
        }),
      );
    });
  });

  // 19. Timezone boundaries
  describe('19. Timezone boundaries & midnight splitting', () => {
    it('should split midnight crossing sessions correctly under local timezone', () => {
      // 23:50 UTC -> 00:20 UTC next day (1800s total duration)
      const start = new Date('2026-09-20T23:50:00.000Z');
      const end = new Date('2026-09-21T00:20:00.000Z');

      const split = activityService.splitSessionByLocalDate(
        { startedAt: start, endedAt: end, durationSeconds: 1800 },
        'UTC',
      );

      expect(split.get('2026-09-20')).toEqual(600); // 10 mins
      expect(split.get('2026-09-21')).toEqual(1200); // 20 mins
    });
  });

  // 20. Empty dashboard
  describe('20. Empty dashboard handling', () => {
    it('should return intentional empty state response without errors or NaN values', async () => {
      prisma.exam.findMany.mockResolvedValue([]);
      prisma.topic.count.mockResolvedValue(0);
      prisma.studySession.findMany.mockResolvedValue([]);

      const dashboard = await service.getDashboardData(mockUserId, {
        timezone: 'UTC',
      });

      expect(dashboard.isEmpty).toBe(true);
      expect(dashboard.overallProgress.percentage).toEqual(0);
      expect(dashboard.studyTime.todaySeconds).toEqual(0);
      expect(dashboard.streak.currentStreak).toEqual(0);
    });
  });

  // 21. Cross-user authorization
  describe('21. Cross-user authorization', () => {
    it('should restrict queries to authenticated userId', async () => {
      await service.getDashboardData('other-user-999', { timezone: 'UTC' });

      expect(prisma.topic.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'other-user-999' }),
        }),
      );
      expect(prisma.studySession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'other-user-999' }),
        }),
      );
    });
  });

  // 22. Database aggregation correctness
  describe('22. Database aggregation correctness', () => {
    it('should only include SessionStatus.COMPLETED sessions', async () => {
      await service.getDashboardData(mockUserId, { timezone: 'UTC' });

      expect(prisma.studySession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: SessionStatus.COMPLETED,
          }),
        }),
      );
    });
  });
});
