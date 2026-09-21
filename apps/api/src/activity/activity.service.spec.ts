import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { PrismaService } from '../database/prisma.service';
import {
  SessionStatus,
  MIN_STUDY_SECONDS_FOR_ACTIVITY,
  getActivityLevel,
} from '@studyos/shared';

describe('ActivityService', () => {
  let service: ActivityService;
  let prisma: any;

  const mockUserId = 'user-1';
  const mockOtherUserId = 'user-2';

  beforeEach(async () => {
    prisma = {
      studySession: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      topicProgress: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  // 1. Activity Day Threshold Test
  describe('1. Activity Day Threshold', () => {
    it('should classify 14 minutes as inactive and 15 minutes as active', () => {
      expect(14 * 60).toBeLessThan(MIN_STUDY_SECONDS_FOR_ACTIVITY);
      expect(15 * 60).toBeGreaterThanOrEqual(MIN_STUDY_SECONDS_FOR_ACTIVITY);

      expect(getActivityLevel(14 * 60)).toEqual(0);
      expect(getActivityLevel(15 * 60)).toEqual(1);
    });
  });

  // 2. Activity Intensity Level Calculation
  describe('2. Activity Intensity Levels', () => {
    it('should calculate intensity levels correctly (0..4)', () => {
      expect(getActivityLevel(0)).toEqual(0); // Level 0: 0m
      expect(getActivityLevel(14 * 60)).toEqual(0); // Level 0: 14m
      expect(getActivityLevel(15 * 60)).toEqual(1); // Level 1: 15m
      expect(getActivityLevel(29 * 60)).toEqual(1); // Level 1: 29m
      expect(getActivityLevel(30 * 60)).toEqual(2); // Level 2: 30m
      expect(getActivityLevel(59 * 60)).toEqual(2); // Level 2: 59m
      expect(getActivityLevel(60 * 60)).toEqual(3); // Level 3: 60m
      expect(getActivityLevel(119 * 60)).toEqual(3); // Level 3: 119m
      expect(getActivityLevel(120 * 60)).toEqual(4); // Level 4: 120m+
      expect(getActivityLevel(240 * 60)).toEqual(4); // Level 4: 240m
    });
  });

  // 3. No Activity Day
  describe('3. No Activity Day', () => {
    it('should return active = false when study time is below threshold', async () => {
      prisma.studySession.findMany.mockResolvedValue([]);
      prisma.topicProgress.findMany.mockResolvedValue([]);

      const todayStr = service.getTodayLocalDate('UTC');
      const heatmap = await service.getHeatmap(
        mockUserId,
        todayStr,
        todayStr,
        'UTC',
      );

      expect(heatmap.days.length).toEqual(1);
      expect(heatmap.days[0].isActive).toBe(false);
      expect(heatmap.days[0].activityLevel).toEqual(0);
      expect(heatmap.days[0].studySeconds).toEqual(0);
    });
  });

  // 4. One Active Day
  describe('4. One Active Day', () => {
    it('should mark day active when study duration meets threshold (20 mins)', async () => {
      const todayStr = service.getTodayLocalDate('UTC');
      const dateObj = new Date(`${todayStr}T10:00:00.000Z`);

      prisma.studySession.findMany.mockResolvedValue([
        {
          id: 's1',
          topicId: 't1',
          startedAt: dateObj,
          endedAt: new Date(dateObj.getTime() + 1200 * 1000),
          durationSeconds: 1200, // 20 mins
        },
      ]);
      prisma.topicProgress.findMany.mockResolvedValue([]);

      const streak = await service.getStreak(mockUserId, 'UTC');
      expect(streak.currentStreak).toEqual(1);
      expect(streak.longestStreak).toEqual(1);
      expect(streak.totalActiveDays).toEqual(1);
      expect(streak.isTodayActive).toBe(true);
    });
  });

  // 5. Consecutive Active Days
  describe('5. Consecutive Active Days', () => {
    it('should increment streak for consecutive active study days', async () => {
      const todayStr = service.getTodayLocalDate('UTC');
      const d1 = service.shiftLocalDate(todayStr, -2);
      const d2 = service.shiftLocalDate(todayStr, -1);
      const d3 = todayStr;

      prisma.studySession.findMany.mockResolvedValue([
        {
          id: 's1',
          topicId: 't1',
          startedAt: new Date(`${d1}T10:00:00.000Z`),
          endedAt: new Date(`${d1}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
        {
          id: 's2',
          topicId: 't2',
          startedAt: new Date(`${d2}T10:00:00.000Z`),
          endedAt: new Date(`${d2}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
        {
          id: 's3',
          topicId: 't3',
          startedAt: new Date(`${d3}T10:00:00.000Z`),
          endedAt: new Date(`${d3}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
      ]);
      prisma.topicProgress.findMany.mockResolvedValue([]);

      const streak = await service.getStreak(mockUserId, 'UTC');
      expect(streak.currentStreak).toEqual(3);
      expect(streak.longestStreak).toEqual(3);
      expect(streak.totalActiveDays).toEqual(3);
    });
  });

  // 6. Broken Streak
  describe('6. Broken Streak', () => {
    it('should reset current streak when a day is missed', async () => {
      const todayStr = service.getTodayLocalDate('UTC');
      const d1 = service.shiftLocalDate(todayStr, -4);
      const d2 = service.shiftLocalDate(todayStr, -3);
      const d3 = service.shiftLocalDate(todayStr, -2);
      // d-1 is missed!
      // today is missed!

      prisma.studySession.findMany.mockResolvedValue([
        {
          id: 's1',
          topicId: 't1',
          startedAt: new Date(`${d1}T10:00:00.000Z`),
          endedAt: new Date(`${d1}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
        {
          id: 's2',
          topicId: 't2',
          startedAt: new Date(`${d2}T10:00:00.000Z`),
          endedAt: new Date(`${d2}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
        {
          id: 's3',
          topicId: 't3',
          startedAt: new Date(`${d3}T10:00:00.000Z`),
          endedAt: new Date(`${d3}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
      ]);
      prisma.topicProgress.findMany.mockResolvedValue([]);

      const streak = await service.getStreak(mockUserId, 'UTC');
      expect(streak.currentStreak).toEqual(0);
      expect(streak.longestStreak).toEqual(3);
      expect(streak.totalActiveDays).toEqual(3);
    });
  });

  // 7. Current Streak Logic
  describe('7. Current Streak Logic', () => {
    it('should preserve streak if yesterday was active even if today is not active yet', async () => {
      const todayStr = service.getTodayLocalDate('UTC');
      const d1 = service.shiftLocalDate(todayStr, -2);
      const d2 = service.shiftLocalDate(todayStr, -1); // Yesterday

      prisma.studySession.findMany.mockResolvedValue([
        {
          id: 's1',
          topicId: 't1',
          startedAt: new Date(`${d1}T10:00:00.000Z`),
          endedAt: new Date(`${d1}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
        {
          id: 's2',
          topicId: 't2',
          startedAt: new Date(`${d2}T10:00:00.000Z`),
          endedAt: new Date(`${d2}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
      ]);
      prisma.topicProgress.findMany.mockResolvedValue([]);

      const streak = await service.getStreak(mockUserId, 'UTC');
      expect(streak.currentStreak).toEqual(2);
      expect(streak.isTodayActive).toBe(false);
    });
  });

  // 8 & 9. Historical Longest Streak
  describe('8 & 9. Historical Longest Streak', () => {
    it('should compute historical longest streak correctly across gaps', async () => {
      // Period 1: Jan 1..Jan 12 (12 active days)
      // Gap
      // Period 2: Feb 3..Feb 8 (6 active days)
      const dates1: string[] = [];
      for (let i = 1; i <= 12; i++) {
        dates1.push(`2026-01-${i < 10 ? '0' + i : i}`);
      }
      const dates2: string[] = [];
      for (let i = 3; i <= 8; i++) {
        dates2.push(`2026-02-${i < 10 ? '0' + i : i}`);
      }

      const mockSessions = [...dates1, ...dates2].map((dateStr, idx) => ({
        id: `s-${idx}`,
        topicId: `t-${idx}`,
        startedAt: new Date(`${dateStr}T10:00:00.000Z`),
        endedAt: new Date(`${dateStr}T11:00:00.000Z`),
        durationSeconds: 3600,
      }));

      prisma.studySession.findMany.mockResolvedValue(mockSessions);
      prisma.topicProgress.findMany.mockResolvedValue([]);

      const streak = await service.getStreak(mockUserId, 'UTC');
      expect(streak.longestStreak).toEqual(12);
      expect(streak.totalActiveDays).toEqual(18);
    });
  });

  // 10. Study Crossing Midnight
  describe('10. Session Crossing Midnight', () => {
    it('should split duration across local calendar days when session crosses midnight', () => {
      // Session starts at 23:50 (Day 1) and ends at 00:20 (Day 2) -> 30 mins total (1800s)
      const startedAt = new Date('2026-09-20T23:50:00.000Z');
      const endedAt = new Date('2026-09-21T00:20:00.000Z');
      const session = {
        startedAt,
        endedAt,
        durationSeconds: 1800,
      };

      const splitMap = service.splitSessionByLocalDate(session, 'UTC');

      expect(splitMap.get('2026-09-20')).toEqual(600); // 10 mins
      expect(splitMap.get('2026-09-21')).toEqual(1200); // 20 mins
      expect(splitMap.get('2026-09-20')! + splitMap.get('2026-09-21')!).toEqual(1800);
    });
  });

  // 11. Timezone Conversion
  describe('11. Timezone Conversion', () => {
    it('should bucket activity according to user local timezone rather than UTC', () => {
      // 2026-09-20 23:30 UTC = 2026-09-21 05:00 in Asia/Kolkata (+5:30)
      const utcDate = new Date('2026-09-20T23:30:00.000Z');

      const utcDateStr = service.formatLocalDate(utcDate, 'UTC');
      const kolkataDateStr = service.formatLocalDate(utcDate, 'Asia/Kolkata');

      expect(utcDateStr).toEqual('2026-09-20');
      expect(kolkataDateStr).toEqual('2026-09-21');
    });
  });

  // 12. Daily Aggregation Accuracy
  describe('12. Daily Aggregation Accuracy', () => {
    it('should accumulate study time from multiple completed sessions on the same day', async () => {
      const dateStr = '2026-09-20';
      prisma.studySession.findMany.mockResolvedValue([
        {
          id: 's1',
          topicId: 't1',
          startedAt: new Date(`${dateStr}T09:00:00.000Z`),
          endedAt: new Date(`${dateStr}T09:30:00.000Z`),
          durationSeconds: 1800, // 30m
        },
        {
          id: 's2',
          topicId: 't2',
          startedAt: new Date(`${dateStr}T14:00:00.000Z`),
          endedAt: new Date(`${dateStr}T15:00:00.000Z`),
          durationSeconds: 3600, // 60m
        },
      ]);
      prisma.topicProgress.findMany.mockResolvedValue([
        {
          topicId: 't1',
          completedAt: new Date(`${dateStr}T15:00:00.000Z`),
        },
      ]);

      const heatmap = await service.getHeatmap(
        mockUserId,
        dateStr,
        dateStr,
        'UTC',
      );

      expect(heatmap.days[0].studySeconds).toEqual(5400); // 90 mins total
      expect(heatmap.days[0].sessions).toEqual(2);
      expect(heatmap.days[0].topicsStudied).toEqual(2);
      expect(heatmap.days[0].topicsCompleted).toEqual(1);
      expect(heatmap.days[0].activityLevel).toEqual(3); // 60-119m range
    });
  });

  // 13. Discarded / Active Sessions Exclusion
  describe('13. Discarded/Active Sessions Excluded', () => {
    it('should only query COMPLETED sessions for daily activity aggregation', async () => {
      const dateStr = '2026-09-20';
      await service.getHeatmap(mockUserId, dateStr, dateStr, 'UTC');

      expect(prisma.studySession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            status: SessionStatus.COMPLETED,
          }),
        }),
      );
    });
  });

  // 14. Duplicate Aggregation Prevention
  describe('14. Duplicate Aggregation Prevention', () => {
    it('should count distinct topic IDs for topicsStudied count', async () => {
      const dateStr = '2026-09-20';
      prisma.studySession.findMany.mockResolvedValue([
        {
          id: 's1',
          topicId: 'topic-1',
          startedAt: new Date(`${dateStr}T09:00:00.000Z`),
          endedAt: new Date(`${dateStr}T09:30:00.000Z`),
          durationSeconds: 1800,
        },
        {
          id: 's2',
          topicId: 'topic-1', // Same topic studied in second session
          startedAt: new Date(`${dateStr}T14:00:00.000Z`),
          endedAt: new Date(`${dateStr}T14:30:00.000Z`),
          durationSeconds: 1800,
        },
      ]);
      prisma.topicProgress.findMany.mockResolvedValue([]);

      const heatmap = await service.getHeatmap(
        mockUserId,
        dateStr,
        dateStr,
        'UTC',
      );

      expect(heatmap.days[0].sessions).toEqual(2);
      expect(heatmap.days[0].topicsStudied).toEqual(1); // 1 unique topic
    });
  });

  // 15 & 16. Heatmap Date Range
  describe('15 & 16. Heatmap Date Range', () => {
    it('should generate continuous date range response from start to end date', async () => {
      prisma.studySession.findMany.mockResolvedValue([]);
      prisma.topicProgress.findMany.mockResolvedValue([]);

      const heatmap = await service.getHeatmap(
        mockUserId,
        '2026-09-01',
        '2026-09-10',
        'UTC',
      );

      expect(heatmap.days.length).toEqual(10);
      expect(heatmap.from).toEqual('2026-09-01');
      expect(heatmap.to).toEqual('2026-09-10');
      expect(heatmap.days[0].date).toEqual('2026-09-01');
      expect(heatmap.days[9].date).toEqual('2026-09-10');
    });
  });

  // 17. Weekly Consistency
  describe('17. Weekly Consistency', () => {
    it('should compute active days ratio and weekly study time correctly', async () => {
      const todayStr = service.getTodayLocalDate('UTC');
      const d1 = service.shiftLocalDate(todayStr, -1);
      const d2 = service.shiftLocalDate(todayStr, -2);

      prisma.studySession.findMany.mockResolvedValue([
        {
          id: 's1',
          topicId: 't1',
          startedAt: new Date(`${d1}T10:00:00.000Z`),
          endedAt: new Date(`${d1}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
        {
          id: 's2',
          topicId: 't2',
          startedAt: new Date(`${d2}T10:00:00.000Z`),
          endedAt: new Date(`${d2}T10:30:00.000Z`),
          durationSeconds: 1800,
        },
      ]);

      const weekly = await service.getWeeklyActivity(mockUserId, 'UTC');
      expect(weekly.days.length).toEqual(7);
      expect(weekly.activeDaysCount).toEqual(2);
      expect(weekly.totalStudySeconds).toEqual(3600);
    });
  });

  // 18. 30-Day and 90-Day Consistency
  describe('18. 30-Day and 90-Day Consistency', () => {
    it('should calculate consistency percentages accurately for sliding windows', async () => {
      const todayStr = service.getTodayLocalDate('UTC');

      // 18 active days out of last 30 days
      const sessions = [];
      for (let i = 0; i < 18; i++) {
        const dStr = service.shiftLocalDate(todayStr, -i);
        sessions.push({
          id: `s-${i}`,
          topicId: 't1',
          startedAt: new Date(`${dStr}T10:00:00.000Z`),
          endedAt: new Date(`${dStr}T10:30:00.000Z`),
          durationSeconds: 1800,
        });
      }

      prisma.studySession.findMany.mockResolvedValue(sessions);

      const stats = await service.getConsistencyStats(mockUserId, 'UTC');
      expect(stats.activeDays30d).toEqual(18);
      expect(stats.consistency30d).toEqual(60); // 18 / 30 = 60%
    });
  });

  // 19. Cross-User Isolation
  describe('19. Cross-User Authorization & Isolation', () => {
    it('should pass userId parameter strictly into Prisma queries', async () => {
      await service.getStreak(mockUserId, 'UTC');
      expect(prisma.studySession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: mockUserId }),
        }),
      );

      await service.getStreak(mockOtherUserId, 'UTC');
      expect(prisma.studySession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: mockOtherUserId }),
        }),
      );
    });
  });

  // 20. Empty Activity History
  describe('20. Empty Activity History', () => {
    it('should return default zeroed structures when user has zero historical sessions', async () => {
      prisma.studySession.findMany.mockResolvedValue([]);
      prisma.topicProgress.findMany.mockResolvedValue([]);
      prisma.studySession.count.mockResolvedValue(0);

      const streak = await service.getStreak(mockUserId, 'UTC');
      expect(streak.currentStreak).toEqual(0);
      expect(streak.longestStreak).toEqual(0);
      expect(streak.totalActiveDays).toEqual(0);
      expect(streak.lastActiveDate).toBeNull();
      expect(streak.isTodayActive).toBe(false);

      const history = await service.getActivityHistory(mockUserId, {
        page: 1,
        limit: 20,
      });
      expect(history.data).toEqual([]);
      expect(history.meta.total).toEqual(0);
    });
  });
});
