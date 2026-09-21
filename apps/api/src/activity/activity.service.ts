import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  SessionStatus,
  ProgressStatus,
  MIN_STUDY_SECONDS_FOR_ACTIVITY,
  getActivityLevel,
  DailyActivityItem,
  ActivityHeatmapResponse,
  StreakResponse,
  WeeklyActivityResponse,
  ConsistencyStatsResponse,
  ActivityHistoryResponse,
  ActivitySummaryResponse,
  ActivityHistoryQueryDto,
  DailySummaryResponse,
} from '@studyos/shared';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------
  // TIMEZONE & DATE UTILITIES
  // -------------------------------------------------------------------

  /**
   * Formats a Date object into YYYY-MM-DD string in the specified IANA timezone.
   */
  public formatLocalDate(date: Date, timezone: string = 'UTC'): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(date); // Output format: YYYY-MM-DD
    } catch {
      // Fallback to UTC if timezone string is invalid
      return date.toISOString().split('T')[0];
    }
  }

  /**
   * Returns today's local date YYYY-MM-DD in the specified timezone.
   */
  public getTodayLocalDate(timezone: string = 'UTC'): string {
    return this.formatLocalDate(new Date(), timezone);
  }

  /**
   * Gets a date shifted by N days relative to a local date string YYYY-MM-DD.
   */
  public shiftLocalDate(dateStr: string, days: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().split('T')[0];
  }

  /**
   * Returns array of contiguous YYYY-MM-DD date strings from start to end inclusive.
   */
  public getLocalDateSequence(startStr: string, endStr: string): string[] {
    const dates: string[] = [];
    let current = startStr;
    while (current <= endStr) {
      dates.push(current);
      current = this.shiftLocalDate(current, 1);
    }
    return dates;
  }

  /**
   * Splits a completed study session's active duration into local calendar day buckets (YYYY-MM-DD).
   * Handles sessions that cross midnight in the specified timezone.
   */
  public splitSessionByLocalDate(
    session: {
      startedAt: Date | null;
      endedAt: Date | null;
      durationSeconds: number;
    },
    timezone: string = 'UTC',
  ): Map<string, number> {
    const result = new Map<string, number>();

    if (session.durationSeconds <= 0) {
      return result;
    }

    const end = session.endedAt ? new Date(session.endedAt) : new Date();
    const start = session.startedAt
      ? new Date(session.startedAt)
      : new Date(end.getTime() - session.durationSeconds * 1000);

    const startLocalDate = this.formatLocalDate(start, timezone);
    const endLocalDate = this.formatLocalDate(end, timezone);

    // Single calendar day session
    if (startLocalDate === endLocalDate) {
      result.set(startLocalDate, session.durationSeconds);
      return result;
    }

    // Cross-midnight session: split duration proportionally based on elapsed wall-clock time
    const totalElapsedMs = Math.max(1, end.getTime() - start.getTime());
    let currentStartMs = start.getTime();

    while (currentStartMs < end.getTime()) {
      const currentStartDate = new Date(currentStartMs);
      const currentDateStr = this.formatLocalDate(currentStartDate, timezone);

      // Find midnight boundary for currentDateStr in target timezone
      const nextDateStr = this.shiftLocalDate(currentDateStr, 1);
      const [nextY, nextM, nextD] = nextDateStr.split('-').map(Number);

      let nextMidnightMs = Date.UTC(nextY, nextM - 1, nextD);
      // Adjust offset by checking timezone difference
      while (this.formatLocalDate(new Date(nextMidnightMs), timezone) > nextDateStr) {
        nextMidnightMs -= 3600 * 1000;
      }
      while (this.formatLocalDate(new Date(nextMidnightMs), timezone) < nextDateStr) {
        nextMidnightMs += 3600 * 1000;
      }
      // Refine to exact minute
      while (this.formatLocalDate(new Date(nextMidnightMs - 60000), timezone) >= nextDateStr) {
        nextMidnightMs -= 60000;
      }

      const blockEndMs = Math.min(end.getTime(), nextMidnightMs);
      const blockElapsedMs = Math.max(0, blockEndMs - currentStartMs);
      const fraction = blockElapsedMs / totalElapsedMs;
      const allocatedSeconds = Math.round(session.durationSeconds * fraction);

      if (allocatedSeconds > 0) {
        const existing = result.get(currentDateStr) || 0;
        result.set(currentDateStr, existing + allocatedSeconds);
      }

      currentStartMs = Math.max(currentStartMs + 1, blockEndMs);
    }

    // Safety check: ensure total allocated seconds equals session.durationSeconds
    let totalAllocated = 0;
    for (const v of result.values()) totalAllocated += v;
    if (totalAllocated !== session.durationSeconds && result.size > 0) {
      const diff = session.durationSeconds - totalAllocated;
      const firstKey = Array.from(result.keys())[0];
      result.set(firstKey, (result.get(firstKey) || 0) + diff);
    }

    return result;
  }

  // -------------------------------------------------------------------
  // DAILY AGGREGATION MAP BUILDER
  // -------------------------------------------------------------------

  private async buildDailyActivityMap(
    userId: string,
    timezone: string = 'UTC',
    fromDate?: Date,
    toDate?: Date,
  ): Promise<
    Map<
      string,
      {
        studySeconds: number;
        sessionsCount: number;
        topicIds: Set<string>;
        topicsCompletedCount: number;
      }
    >
  > {
    const sessionWhere: any = {
      userId,
      status: SessionStatus.COMPLETED,
    };

    if (fromDate || toDate) {
      sessionWhere.endedAt = {};
      // Expand filter margin by 1 day to catch cross-midnight sessions
      if (fromDate) {
        const marginFrom = new Date(fromDate.getTime() - 86400000);
        sessionWhere.endedAt.gte = marginFrom;
      }
      if (toDate) {
        const marginTo = new Date(toDate.getTime() + 86400000);
        sessionWhere.endedAt.lte = marginTo;
      }
    }

    const completedSessions = await this.prisma.studySession.findMany({
      where: sessionWhere,
      select: {
        id: true,
        topicId: true,
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
      },
    });

    const topicWhere: any = {
      userId,
      status: ProgressStatus.COMPLETED,
      completedAt: { not: null },
    };

    if (fromDate || toDate) {
      topicWhere.completedAt = {};
      if (fromDate) topicWhere.completedAt.gte = fromDate;
      if (toDate) topicWhere.completedAt.lte = toDate;
    }

    const completedTopics = await this.prisma.topicProgress.findMany({
      where: topicWhere,
      select: {
        topicId: true,
        completedAt: true,
      },
    });

    const map = new Map<
      string,
      {
        studySeconds: number;
        sessionsCount: number;
        topicIds: Set<string>;
        topicsCompletedCount: number;
      }
    >();

    const getOrCreateBucket = (dateStr: string) => {
      let b = map.get(dateStr);
      if (!b) {
        b = {
          studySeconds: 0,
          sessionsCount: 0,
          topicIds: new Set<string>(),
          topicsCompletedCount: 0,
        };
        map.set(dateStr, b);
      }
      return b;
    };

    // Process sessions
    for (const s of completedSessions || []) {
      const splitMap = this.splitSessionByLocalDate(s, timezone);
      for (const [dateStr, seconds] of splitMap.entries()) {
        const bucket = getOrCreateBucket(dateStr);
        bucket.studySeconds += seconds;
        bucket.sessionsCount += 1;
        if (s.topicId) {
          bucket.topicIds.add(s.topicId);
        }
      }
    }

    // Process completed topics
    for (const t of completedTopics || []) {
      if (t.completedAt) {
        const dateStr = this.formatLocalDate(new Date(t.completedAt), timezone);
        const bucket = getOrCreateBucket(dateStr);
        bucket.topicsCompletedCount += 1;
      }
    }

    return map;
  }

  // -------------------------------------------------------------------
  // HEATMAP ENDPOINT LOGIC
  // -------------------------------------------------------------------

  async getHeatmap(
    userId: string,
    fromStr?: string,
    toStr?: string,
    timezone: string = 'UTC',
  ): Promise<ActivityHeatmapResponse> {
    const todayStr = this.getTodayLocalDate(timezone);
    const endDateStr = toStr || todayStr;
    const startDateStr = fromStr || this.shiftLocalDate(endDateStr, -364);

    const fromDate = new Date(`${startDateStr}T00:00:00.000Z`);
    const toDate = new Date(`${endDateStr}T23:59:59.999Z`);

    const dailyMap = await this.buildDailyActivityMap(
      userId,
      timezone,
      fromDate,
      toDate,
    );

    const dateSequence = this.getLocalDateSequence(startDateStr, endDateStr);
    let totalActiveDays = 0;
    let totalStudySeconds = 0;

    const days: DailyActivityItem[] = dateSequence.map((dateStr) => {
      const bucket = dailyMap.get(dateStr);
      const studySec = bucket ? bucket.studySeconds : 0;
      const sessions = bucket ? bucket.sessionsCount : 0;
      const topicsStudied = bucket ? bucket.topicIds.size : 0;
      const topicsCompleted = bucket ? bucket.topicsCompletedCount : 0;
      const activityLevel = getActivityLevel(studySec);
      const isActive = studySec >= MIN_STUDY_SECONDS_FOR_ACTIVITY;

      if (isActive) totalActiveDays += 1;
      totalStudySeconds += studySec;

      return {
        date: dateStr,
        studySeconds: studySec,
        sessions,
        topicsStudied,
        topicsCompleted,
        activityLevel,
        isActive,
      };
    });

    return {
      from: startDateStr,
      to: endDateStr,
      timezone,
      totalActiveDays,
      totalStudySeconds,
      days,
    };
  }

  // -------------------------------------------------------------------
  // STREAK ENDPOINT LOGIC
  // -------------------------------------------------------------------

  async getStreak(userId: string, timezone: string = 'UTC'): Promise<StreakResponse> {
    const dailyMap = await this.buildDailyActivityMap(userId, timezone);
    const todayStr = this.getTodayLocalDate(timezone);
    const yesterdayStr = this.shiftLocalDate(todayStr, -1);

    const todayStudySec = dailyMap.get(todayStr)?.studySeconds || 0;
    const isTodayActive = todayStudySec >= MIN_STUDY_SECONDS_FOR_ACTIVITY;

    // Build array of all active dates sorted ascending
    const activeDates: string[] = [];
    for (const [dateStr, bucket] of dailyMap.entries()) {
      if (bucket.studySeconds >= MIN_STUDY_SECONDS_FOR_ACTIVITY) {
        activeDates.push(dateStr);
      }
    }
    activeDates.sort();

    const totalActiveDays = activeDates.length;
    const lastActiveDate = activeDates.length > 0 ? activeDates[activeDates.length - 1] : null;

    // Calculate current streak
    let currentStreak = 0;
    let checkDateStr: string | null = null;

    if (isTodayActive) {
      checkDateStr = todayStr;
    } else if (dailyMap.get(yesterdayStr) && (dailyMap.get(yesterdayStr)!.studySeconds >= MIN_STUDY_SECONDS_FOR_ACTIVITY)) {
      checkDateStr = yesterdayStr;
    }

    if (checkDateStr) {
      let curr = checkDateStr;
      while (dailyMap.has(curr) && dailyMap.get(curr)!.studySeconds >= MIN_STUDY_SECONDS_FOR_ACTIVITY) {
        currentStreak += 1;
        curr = this.shiftLocalDate(curr, -1);
      }
    }

    // Calculate longest streak historically across activeDates
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: string | null = null;

    for (const dStr of activeDates) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const expectedNext = this.shiftLocalDate(prevDate, 1);
        if (dStr === expectedNext) {
          tempStreak += 1;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = dStr;
    }

    return {
      currentStreak,
      longestStreak,
      totalActiveDays,
      lastActiveDate,
      isTodayActive,
    };
  }

  // -------------------------------------------------------------------
  // WEEKLY ACTIVITY LOGIC
  // -------------------------------------------------------------------

  async getWeeklyActivity(
    userId: string,
    timezone: string = 'UTC',
  ): Promise<WeeklyActivityResponse> {
    const todayStr = this.getTodayLocalDate(timezone);
    const startDateStr = this.shiftLocalDate(todayStr, -6); // 7 days: today-6 to today

    const fromDate = new Date(`${startDateStr}T00:00:00.000Z`);
    const toDate = new Date(`${todayStr}T23:59:59.999Z`);

    const dailyMap = await this.buildDailyActivityMap(
      userId,
      timezone,
      fromDate,
      toDate,
    );

    const dateSequence = this.getLocalDateSequence(startDateStr, todayStr);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let totalStudySeconds = 0;
    let activeDaysCount = 0;

    const days = dateSequence.map((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      const dayName = dayNames[dateObj.getUTCDay()];

      const bucket = dailyMap.get(dateStr);
      const studySeconds = bucket ? bucket.studySeconds : 0;
      const isActive = studySeconds >= MIN_STUDY_SECONDS_FOR_ACTIVITY;

      totalStudySeconds += studySeconds;
      if (isActive) activeDaysCount += 1;

      return {
        date: dateStr,
        dayName,
        studySeconds,
        isActive,
      };
    });

    return {
      days,
      totalStudySeconds,
      activeDaysCount,
      totalDaysCount: 7,
    };
  }

  // -------------------------------------------------------------------
  // CONSISTENCY METRICS LOGIC
  // -------------------------------------------------------------------

  async getConsistencyStats(
    userId: string,
    timezone: string = 'UTC',
  ): Promise<ConsistencyStatsResponse> {
    const todayStr = this.getTodayLocalDate(timezone);
    const startDateStr = this.shiftLocalDate(todayStr, -89); // 90 days range

    const fromDate = new Date(`${startDateStr}T00:00:00.000Z`);
    const toDate = new Date(`${todayStr}T23:59:59.999Z`);

    const dailyMap = await this.buildDailyActivityMap(
      userId,
      timezone,
      fromDate,
      toDate,
    );

    const calculateActiveDaysInLastNDays = (n: number) => {
      let activeCount = 0;
      for (let i = 0; i < n; i++) {
        const dStr = this.shiftLocalDate(todayStr, -i);
        const sec = dailyMap.get(dStr)?.studySeconds || 0;
        if (sec >= MIN_STUDY_SECONDS_FOR_ACTIVITY) {
          activeCount += 1;
        }
      }
      return activeCount;
    };

    const activeDays7d = calculateActiveDaysInLastNDays(7);
    const activeDays30d = calculateActiveDaysInLastNDays(30);
    const activeDays90d = calculateActiveDaysInLastNDays(90);

    return {
      consistency7d: Math.round((activeDays7d / 7) * 100),
      consistency30d: Math.round((activeDays30d / 30) * 100),
      consistency90d: Math.round((activeDays90d / 90) * 100),
      activeDays7d,
      activeDays30d,
      activeDays90d,
    };
  }

  // -------------------------------------------------------------------
  // ACTIVITY HISTORY LOGIC
  // -------------------------------------------------------------------

  async getActivityHistory(
    userId: string,
    query: ActivityHistoryQueryDto,
  ): Promise<ActivityHistoryResponse> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      status: SessionStatus.COMPLETED,
    };

    const [total, sessions] = await Promise.all([
      this.prisma.studySession.count({ where }),
      this.prisma.studySession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { endedAt: 'desc' },
        include: {
          topic: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true, colorHex: true } },
          exam: { select: { id: true, title: true } },
        },
      }),
    ]);

    const data = sessions.map((s) => ({
      id: s.id,
      topicId: s.topicId,
      topicName: s.topic?.name || 'Unknown Topic',
      subjectId: s.subjectId,
      subjectName: s.subject?.name || null,
      subjectColorHex: s.subject?.colorHex || null,
      examId: s.examId,
      examTitle: s.exam?.title || null,
      startedAt: s.startedAt?.toISOString() || null,
      endedAt: s.endedAt?.toISOString() || null,
      durationSeconds: s.durationSeconds,
      sessionType: s.sessionType,
      confidence: s.confidence,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // -------------------------------------------------------------------
  // UNIFIED SUMMARY ENDPOINT (FOR DASHBOARD)
  // -------------------------------------------------------------------

  async getActivitySummary(
    userId: string,
    timezone: string = 'UTC',
  ): Promise<ActivitySummaryResponse> {
    const todayStr = this.getTodayLocalDate(timezone);
    const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${todayStr}T23:59:59.999Z`);

    const [todaySessions, todayCompletedTopics, streak, weekly, consistency] =
      await Promise.all([
        this.prisma.studySession.findMany({
          where: {
            userId,
            status: SessionStatus.COMPLETED,
            endedAt: { gte: startOfDay, lte: endOfDay },
          },
          include: {
            subject: { select: { id: true, name: true, colorHex: true } },
          },
        }),
        this.prisma.topicProgress.count({
          where: {
            userId,
            status: ProgressStatus.COMPLETED,
            completedAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        this.getStreak(userId, timezone),
        this.getWeeklyActivity(userId, timezone),
        this.getConsistencyStats(userId, timezone),
      ]);

    let totalStudySeconds = 0;
    const studiedTopicIds = new Set<string>();
    const subjectMap = new Map<
      string,
      { id: string; name: string; colorHex?: string | null; durationSeconds: number }
    >();

    for (const s of todaySessions) {
      totalStudySeconds += s.durationSeconds;
      studiedTopicIds.add(s.topicId);
      if (s.subject) {
        const existing = subjectMap.get(s.subject.id) || {
          id: s.subject.id,
          name: s.subject.name,
          colorHex: s.subject.colorHex,
          durationSeconds: 0,
        };
        existing.durationSeconds += s.durationSeconds;
        subjectMap.set(s.subject.id, existing);
      }
    }

    const today: DailySummaryResponse = {
      date: todayStr,
      timezone,
      totalStudySeconds,
      sessionCount: todaySessions.length,
      topicsStudiedCount: studiedTopicIds.size,
      topicsCompletedCount: todayCompletedTopics,
      subjectsStudied: Array.from(subjectMap.values()),
    };

    return {
      today,
      streak,
      weekly,
      consistency,
    };
  }
}
