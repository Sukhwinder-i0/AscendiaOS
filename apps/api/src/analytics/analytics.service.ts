import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ActivityService } from '../activity/activity.service';
import {
  SessionStatus,
  ProgressStatus,
  AnalyticsDashboardQueryDto,
  DashboardAnalyticsResponse,
  SubjectDetailAnalyticsResponse,
  TopicProgressQueryDto,
  PaginatedTopicProgressResponse,
  TrendPeriod,
  SubjectAnalyticsItem,
  ChapterAnalyticsItem,
  StudyTrendPoint,
  StudyTrendResponse,
  SubjectDistributionResponse,
  SubjectDistributionItem,
  TopicSummariesResponse,
  TopicProgressSummaryItem,
  GroupedRecentActivity,
  RecentActivityItem,
  SummaryPeriodMetric,
  ComparisonMetric,
  QuickActionsContextResponse,
  MIN_STUDY_SECONDS_FOR_ACTIVITY,
} from '@ascendiaos/shared';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Helper to format seconds into readable "Xh Ym" or "Ym" format.
   */
  public formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  /**
   * Primary dashboard endpoint handler. Aggregates all dashboard metrics.
   */
  async getDashboardData(
    userId: string,
    query: AnalyticsDashboardQueryDto,
  ): Promise<DashboardAnalyticsResponse> {
    const timezone = query.timezone || 'UTC';
    const trendPeriod: TrendPeriod = query.trendPeriod || '30d';

    // 1. Fetch available exams for user
    const availableExams = await this.prisma.exam.findMany({
      where: { userId, isArchived: false },
      select: { id: true, title: true, code: true, targetDate: true, dailyGoalHours: true },
      orderBy: { createdAt: 'asc' },
    });

    // Determine target exam
    let selectedExamId = query.examId;
    if (!selectedExamId && availableExams.length > 0) {
      selectedExamId = availableExams[0].id;
    }

    const currentExam = selectedExamId
      ? availableExams.find((e) => e.id === selectedExamId) || null
      : null;

    let daysRemaining: number | null = null;
    if (currentExam?.targetDate) {
      const todayStr = this.activityService.getTodayLocalDate(timezone);
      const todayDate = new Date(`${todayStr}T00:00:00.000Z`);
      const targetDate = new Date(currentExam.targetDate);
      const diffMs = targetDate.getTime() - todayDate.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const examResponse = currentExam
      ? {
          id: currentExam.id,
          title: currentExam.title,
          code: currentExam.code,
          targetDate: currentExam.targetDate ? currentExam.targetDate.toISOString() : null,
          daysRemaining,
          dailyGoalHours: currentExam.dailyGoalHours,
        }
      : null;

    // 2. Aggregate Overall Progress
    const topicWhere: any = { userId };
    if (selectedExamId) {
      topicWhere.chapter = { subject: { examId: selectedExamId } };
    }

    const [totalTopicsCount, completedTopicsCount] = await Promise.all([
      this.prisma.topic.count({ where: topicWhere }),
      this.prisma.topic.count({
        where: {
          ...topicWhere,
          progress: {
            status: { in: [ProgressStatus.COMPLETED, ProgressStatus.MASTERED] },
          },
        },
      }),
    ]);

    const overallProgressPercentage =
      totalTopicsCount > 0
        ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
        : 0;

    const overallProgress = {
      completedTopics: completedTopicsCount,
      totalTopics: totalTopicsCount,
      percentage: overallProgressPercentage,
      methodology: 'completed topics / total topics × 100',
    };

    // 3. Study Time Breakdown (Today, Week, Month, Last 30 Days)
    const todayStr = this.activityService.getTodayLocalDate(timezone);

    const weekStartStr = this.activityService.shiftLocalDate(todayStr, -6);
    const monthStartStr = this.activityService.shiftLocalDate(todayStr, -29);

    const sessionWhereBase: any = {
      userId,
      status: SessionStatus.COMPLETED,
    };
    if (selectedExamId) {
      sessionWhereBase.examId = selectedExamId;
    }

    const sessions = await this.prisma.studySession.findMany({
      where: sessionWhereBase,
      select: {
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
      },
    });

    let todaySeconds = 0;
    let weekSeconds = 0;
    let monthSeconds = 0;
    let last30DaysSeconds = 0;

    for (const s of sessions) {
      const splitMap = this.activityService.splitSessionByLocalDate(s, timezone);
      for (const [dStr, secs] of splitMap.entries()) {
        if (dStr === todayStr) {
          todaySeconds += secs;
        }
        if (dStr >= weekStartStr && dStr <= todayStr) {
          weekSeconds += secs;
        }
        if (dStr >= monthStartStr && dStr <= todayStr) {
          monthSeconds += secs;
          last30DaysSeconds += secs;
        }
      }
    }

    const studyTime = {
      todaySeconds,
      weekSeconds,
      monthSeconds,
      last30DaysSeconds,
    };

    // 4. Streak & Heatmap (reusing ActivityService)
    const streak = await this.activityService.getStreak(userId, timezone);
    const heatmap = await this.activityService.getHeatmap(
      userId,
      this.activityService.shiftLocalDate(todayStr, -364),
      todayStr,
      timezone,
    );

    // 5. Subject Progress Breakdown
    const subjects = await this.getSubjectAnalyticsList(userId, selectedExamId, timezone);

    // 6. Study Trend
    const studyTrend = await this.getStudyTrend(userId, selectedExamId, trendPeriod, timezone);

    // 7. Subject Distribution (This Month / 30d)
    const subjectDistribution = await this.getSubjectDistribution(
      userId,
      selectedExamId,
      30,
      timezone,
    );

    // 8. Recent Activity
    const recentActivity = await this.getRecentActivityTimeline(
      userId,
      selectedExamId,
      timezone,
    );

    // 9. Topic Summaries (Counts, Not Started, Recently Completed, Needs Revision)
    const topicSummaries = await this.getTopicSummaries(userId, selectedExamId, timezone);

    // 10. Quick Actions Context
    const quickActions = await this.getQuickActionsContext(userId, selectedExamId);

    // 11. Weekly & Monthly Summaries with Neutral Comparisons
    const weeklySummary = await this.getPeriodSummary(userId, selectedExamId, 7, timezone);
    const monthlySummary = await this.getPeriodSummary(userId, selectedExamId, 30, timezone);

    const isEmpty =
      totalTopicsCount === 0 &&
      sessions.length === 0 &&
      streak.totalActiveDays === 0;

    return {
      exam: examResponse,
      availableExams,
      overallProgress,
      studyTime,
      streak,
      subjects,
      studyTrend,
      subjectDistribution,
      heatmap,
      recentActivity,
      topicSummaries,
      quickActions,
      weeklySummary,
      monthlySummary,
      isEmpty,
    };
  }

  /**
   * Helper to get list of subject analytics for an exam.
   */
  public async getSubjectAnalyticsList(
    userId: string,
    examId?: string,
    timezone: string = 'UTC',
  ): Promise<SubjectAnalyticsItem[]> {
    const subjectWhere: any = { userId };
    if (examId) {
      subjectWhere.examId = examId;
    }

    const subjectsRaw = await this.prisma.subject.findMany({
      where: subjectWhere,
      orderBy: { orderIndex: 'asc' },
      include: {
        chapters: {
          include: {
            topics: {
              include: {
                progress: true,
              },
            },
          },
        },
        studySessions: {
          where: { status: SessionStatus.COMPLETED },
          select: {
            startedAt: true,
            endedAt: true,
            durationSeconds: true,
          },
        },
      },
    });

    return subjectsRaw.map((sub) => {
      let totalTopicsCount = 0;
      let completedTopicsCount = 0;
      let lastStudiedDate: Date | null = null;

      for (const chap of sub.chapters) {
        for (const top of chap.topics) {
          totalTopicsCount++;
          if (
            top.progress?.status === ProgressStatus.COMPLETED ||
            top.progress?.status === ProgressStatus.MASTERED
          ) {
            completedTopicsCount++;
          }
          if (top.progress?.lastStudiedAt) {
            const d = new Date(top.progress.lastStudiedAt);
            if (!lastStudiedDate || d > lastStudiedDate) {
              lastStudiedDate = d;
            }
          }
        }
      }

      let studyTimeSeconds = 0;
      for (const s of sub.studySessions) {
        studyTimeSeconds += s.durationSeconds;
        if (s.endedAt) {
          const d = new Date(s.endedAt);
          if (!lastStudiedDate || d > lastStudiedDate) {
            lastStudiedDate = d;
          }
        }
      }

      const progressPercentage =
        totalTopicsCount > 0
          ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
          : 0;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        colorHex: sub.colorHex,
        progressPercentage,
        completedTopicsCount,
        totalTopicsCount,
        studyTimeSeconds,
        lastStudiedAt: lastStudiedDate
          ? this.activityService.formatLocalDate(lastStudiedDate, timezone)
          : null,
      };
    });
  }

  /**
   * Subject detail page rich analytics.
   */
  async getSubjectDetailAnalytics(
    userId: string,
    subjectId: string,
    timezone: string = 'UTC',
  ): Promise<SubjectDetailAnalyticsResponse> {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            topics: {
              include: {
                progress: true,
              },
            },
          },
        },
        studySessions: {
          where: { status: SessionStatus.COMPLETED },
          select: {
            startedAt: true,
            endedAt: true,
            durationSeconds: true,
          },
        },
      },
    });

    if (!subject || subject.userId !== userId) {
      throw new NotFoundException('Subject not found');
    }

    let subTotalTopics = 0;
    let subCompletedTopics = 0;
    let lastStudiedDate: Date | null = null;

    const chapters: ChapterAnalyticsItem[] = subject.chapters.map((chap) => {
      let chapTotalTopics = 0;
      let chapCompletedTopics = 0;

      for (const t of chap.topics) {
        chapTotalTopics++;
        subTotalTopics++;

        if (
          t.progress?.status === ProgressStatus.COMPLETED ||
          t.progress?.status === ProgressStatus.MASTERED
        ) {
          chapCompletedTopics++;
          subCompletedTopics++;
        }

        if (t.progress?.lastStudiedAt) {
          const d = new Date(t.progress.lastStudiedAt);
          if (!lastStudiedDate || d > lastStudiedDate) {
            lastStudiedDate = d;
          }
        }
      }

      const chapProgress =
        chapTotalTopics > 0
          ? Math.round((chapCompletedTopics / chapTotalTopics) * 100)
          : 0;

      return {
        id: chap.id,
        name: chap.name,
        orderIndex: chap.orderIndex,
        progressPercentage: chapProgress,
        completedTopicsCount: chapCompletedTopics,
        totalTopicsCount: chapTotalTopics,
      };
    });

    let totalStudyTimeSeconds = 0;
    const activeDatesSet = new Set<string>();

    for (const s of subject.studySessions) {
      totalStudyTimeSeconds += s.durationSeconds;
      if (s.endedAt) {
        const d = new Date(s.endedAt);
        if (!lastStudiedDate || d > lastStudiedDate) {
          lastStudiedDate = d;
        }
      }
      const splitMap = this.activityService.splitSessionByLocalDate(s, timezone);
      for (const [dStr, sec] of splitMap.entries()) {
        if (sec >= MIN_STUDY_SECONDS_FOR_ACTIVITY) {
          activeDatesSet.add(dStr);
        }
      }
    }

    const subProgressPercentage =
      subTotalTopics > 0
        ? Math.round((subCompletedTopics / subTotalTopics) * 100)
        : 0;

    const subjectItem: SubjectAnalyticsItem = {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      colorHex: subject.colorHex,
      progressPercentage: subProgressPercentage,
      completedTopicsCount: subCompletedTopics,
      totalTopicsCount: subTotalTopics,
      studyTimeSeconds: totalStudyTimeSeconds,
      lastStudiedAt: lastStudiedDate
        ? this.activityService.formatLocalDate(lastStudiedDate, timezone)
        : null,
    };

    return {
      subject: subjectItem,
      sessionsCount: subject.studySessions.length,
      activeDaysCount: activeDatesSet.size,
      chapters,
    };
  }

  /**
   * Calculate Study Time Trend & neutral comparison with previous period.
   */
  public async getStudyTrend(
    userId: string,
    examId?: string,
    period: TrendPeriod = '30d',
    timezone: string = 'UTC',
  ): Promise<StudyTrendResponse> {
    const daysCount = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

    const todayStr = this.activityService.getTodayLocalDate(timezone);
    const startDateStr = this.activityService.shiftLocalDate(todayStr, -(daysCount - 1));

    // Previous period range for comparison
    const prevEndDateStr = this.activityService.shiftLocalDate(startDateStr, -1);
    const prevStartDateStr = this.activityService.shiftLocalDate(prevEndDateStr, -(daysCount - 1));

    const sessionWhere: any = {
      userId,
      status: SessionStatus.COMPLETED,
    };
    if (examId) {
      sessionWhere.examId = examId;
    }

    const sessions = await this.prisma.studySession.findMany({
      where: sessionWhere,
      select: {
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
      },
    });

    const currentMap = new Map<string, number>();
    let totalCurrentSeconds = 0;
    let totalPreviousSeconds = 0;

    for (const s of sessions) {
      const splitMap = this.activityService.splitSessionByLocalDate(s, timezone);
      for (const [dStr, sec] of splitMap.entries()) {
        if (dStr >= startDateStr && dStr <= todayStr) {
          currentMap.set(dStr, (currentMap.get(dStr) || 0) + sec);
          totalCurrentSeconds += sec;
        } else if (dStr >= prevStartDateStr && dStr <= prevEndDateStr) {
          totalPreviousSeconds += sec;
        }
      }
    }

    const dateSeq = this.activityService.getLocalDateSequence(startDateStr, todayStr);
    const points: StudyTrendPoint[] = dateSeq.map((dateStr) => {
      const sec = currentMap.get(dateStr) || 0;
      return {
        date: dateStr,
        studySeconds: sec,
        formattedDuration: this.formatDuration(sec),
      };
    });

    const diffSec = totalCurrentSeconds - totalPreviousSeconds;
    const diffFormatted = this.formatDuration(Math.abs(diffSec));
    const sign = diffSec >= 0 ? '+' : '-';

    const comparisonText =
      diffSec >= 0
        ? `Study time increased by ${diffFormatted} compared with the previous ${period} period.`
        : `Study time decreased by ${diffFormatted} compared with the previous ${period} period.`;

    const comparison: ComparisonMetric = {
      currentValue: totalCurrentSeconds,
      previousValue: totalPreviousSeconds,
      difference: diffSec,
      formattedDifference: `${sign}${diffFormatted}`,
      text: comparisonText,
    };

    const accessibleSummary = `Study time for the last ${daysCount} days total ${this.formatDuration(
      totalCurrentSeconds,
    )}. ${comparisonText}`;

    return {
      period,
      points,
      totalStudySeconds: totalCurrentSeconds,
      comparison,
      accessibleSummary,
    };
  }

  /**
   * Calculate Subject Study Time Distribution for selected period (e.g., 30d).
   */
  public async getSubjectDistribution(
    userId: string,
    examId?: string,
    periodDays: number = 30,
    timezone: string = 'UTC',
  ): Promise<SubjectDistributionResponse> {
    const todayStr = this.activityService.getTodayLocalDate(timezone);
    const startDateStr = this.activityService.shiftLocalDate(todayStr, -(periodDays - 1));

    const sessionWhere: any = {
      userId,
      status: SessionStatus.COMPLETED,
    };
    if (examId) {
      sessionWhere.examId = examId;
    }

    const sessions = await this.prisma.studySession.findMany({
      where: sessionWhere,
      select: {
        subjectId: true,
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
        subject: { select: { id: true, name: true, colorHex: true } },
      },
    });

    const subjectMap = new Map<
      string,
      { subjectId: string; subjectName: string; colorHex: string | null; studyTimeSeconds: number }
    >();

    let totalStudySeconds = 0;

    for (const s of sessions) {
      const splitMap = this.activityService.splitSessionByLocalDate(s, timezone);
      for (const [dStr, sec] of splitMap.entries()) {
        if (dStr >= startDateStr && dStr <= todayStr) {
          totalStudySeconds += sec;
          const subId = s.subjectId || 'unassigned';
          const subName = s.subject?.name || 'Other';
          const colorHex = s.subject?.colorHex || '#9CA3AF';

          const existing = subjectMap.get(subId) || {
            subjectId: subId,
            subjectName: subName,
            colorHex,
            studyTimeSeconds: 0,
          };
          existing.studyTimeSeconds += sec;
          subjectMap.set(subId, existing);
        }
      }
    }

    const items: SubjectDistributionItem[] = Array.from(subjectMap.values())
      .map((item) => ({
        ...item,
        percentage:
          totalStudySeconds > 0
            ? Math.round((item.studyTimeSeconds / totalStudySeconds) * 100)
            : 0,
      }))
      .sort((a, b) => b.studyTimeSeconds - a.studyTimeSeconds);

    return {
      periodDays,
      totalStudySeconds,
      items,
    };
  }

  /**
   * Recent Activity Timeline (Sessions and Completions grouped by day).
   */
  public async getRecentActivityTimeline(
    userId: string,
    examId?: string,
    timezone: string = 'UTC',
    limit: number = 15,
  ): Promise<GroupedRecentActivity[]> {
    const todayStr = this.activityService.getTodayLocalDate(timezone);
    const yesterdayStr = this.activityService.shiftLocalDate(todayStr, -1);

    const sessionWhere: any = {
      userId,
      status: SessionStatus.COMPLETED,
    };
    if (examId) {
      sessionWhere.examId = examId;
    }

    const recentSessions = await this.prisma.studySession.findMany({
      where: sessionWhere,
      take: limit,
      orderBy: { endedAt: 'desc' },
      select: {
        id: true,
        topicId: true,
        endedAt: true,
        durationSeconds: true,
        topic: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, colorHex: true } },
      },
    });

    const topicWhere: any = {
      userId,
      status: ProgressStatus.COMPLETED,
      completedAt: { not: null },
    };
    if (examId) {
      topicWhere.topic = { chapter: { subject: { examId } } };
    }

    const recentCompletions = await this.prisma.topicProgress.findMany({
      where: topicWhere,
      take: limit,
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        topicId: true,
        completedAt: true,
        topic: {
          select: {
            id: true,
            name: true,
            chapter: { select: { subject: { select: { id: true, name: true, colorHex: true } } } },
          },
        },
      },
    });

    const combinedItems: RecentActivityItem[] = [];

    for (const s of recentSessions) {
      if (s.endedAt) {
        const dStr = this.activityService.formatLocalDate(s.endedAt, timezone);
        combinedItems.push({
          id: s.id,
          type: 'SESSION',
          date: dStr,
          timestamp: s.endedAt.toISOString(),
          durationSeconds: s.durationSeconds,
          topicId: s.topicId,
          topicName: s.topic?.name || 'Unknown Topic',
          subjectId: s.subject?.id || null,
          subjectName: s.subject?.name || null,
          subjectColorHex: s.subject?.colorHex || null,
        });
      }
    }

    for (const c of recentCompletions) {
      if (c.completedAt) {
        const dStr = this.activityService.formatLocalDate(c.completedAt, timezone);
        const sub = c.topic?.chapter?.subject;
        combinedItems.push({
          id: c.id,
          type: 'TOPIC_COMPLETED',
          date: dStr,
          timestamp: c.completedAt.toISOString(),
          topicId: c.topicId,
          topicName: c.topic?.name || 'Unknown Topic',
          subjectId: sub?.id || null,
          subjectName: sub?.name || null,
          subjectColorHex: sub?.colorHex || null,
        });
      }
    }

    combinedItems.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const groupsMap = new Map<string, RecentActivityItem[]>();
    for (const item of combinedItems) {
      const list = groupsMap.get(item.date) || [];
      list.push(item);
      groupsMap.set(item.date, list);
    }

    const result: GroupedRecentActivity[] = [];
    for (const [dStr, items] of groupsMap.entries()) {
      let label = dStr;
      if (dStr === todayStr) {
        label = 'Today';
      } else if (dStr === yesterdayStr) {
        label = 'Yesterday';
      }
      result.push({
        date: dStr,
        label,
        items,
      });
    }

    return result.slice(0, 5); // Return top 5 recent days
  }

  /**
   * Topic Summaries (Counts + Lists for Not Started, Recently Completed, Needs Revision).
   */
  public async getTopicSummaries(
    userId: string,
    examId?: string,
    timezone: string = 'UTC',
  ): Promise<TopicSummariesResponse> {
    const topicWhere: any = { userId };
    if (examId) {
      topicWhere.chapter = { subject: { examId } };
    }

    const allTopics = await this.prisma.topic.findMany({
      where: topicWhere,
      include: {
        progress: true,
        chapter: {
          select: {
            id: true,
            name: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    let total = 0;
    let completed = 0;
    let learning = 0;
    let notStarted = 0;
    let needsRevision = 0;
    let mastered = 0;

    const notStartedList: TopicProgressSummaryItem[] = [];
    const completedList: TopicProgressSummaryItem[] = [];
    const needsRevisionList: TopicProgressSummaryItem[] = [];

    for (const t of allTopics) {
      total++;
      const st = t.progress?.status || ProgressStatus.NOT_STARTED;

      const item: TopicProgressSummaryItem = {
        id: t.id,
        name: t.name,
        subjectId: t.chapter?.subject?.id || '',
        subjectName: t.chapter?.subject?.name || 'Unassigned',
        chapterId: t.chapterId,
        chapterName: t.chapter?.name || 'Unassigned',
        status: st as ProgressStatus,
        confidenceScore: t.progress?.confidenceScore || 1,
        totalStudyTimeSec: t.progress?.totalStudyTimeSec || 0,
        lastStudiedAt: t.progress?.lastStudiedAt
          ? this.activityService.formatLocalDate(t.progress.lastStudiedAt, timezone)
          : null,
        completedAt: t.progress?.completedAt
          ? this.activityService.formatLocalDate(t.progress.completedAt, timezone)
          : null,
      };

      if (st === ProgressStatus.COMPLETED) {
        completed++;
        completedList.push(item);
      } else if (st === ProgressStatus.MASTERED) {
        mastered++;
        completed++;
        completedList.push(item);
      } else if (st === ProgressStatus.LEARNING) {
        learning++;
      } else if (st === ProgressStatus.NEEDS_REVISION) {
        needsRevision++;
        needsRevisionList.push(item);
      } else {
        notStarted++;
        notStartedList.push(item);
      }
    }

    completedList.sort((a, b) => {
      const da = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const db = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return db - da;
    });

    return {
      counts: {
        total,
        completed,
        learning,
        notStarted,
        needsRevision,
        mastered,
      },
      notStarted: notStartedList.slice(0, 10),
      recentlyCompleted: completedList.slice(0, 10),
      needsRevision: needsRevisionList.slice(0, 10),
    };
  }

  /**
   * Paginated & filtered topic progress list.
   */
  async getTopicProgressOverview(
    userId: string,
    query: TopicProgressQueryDto,
    timezone: string = 'UTC',
  ): Promise<PaginatedTopicProgressResponse> {
    const { examId, status, sortBy = 'RECENTLY_STUDIED', page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const topicWhere: any = { userId };
    if (examId) {
      topicWhere.chapter = { subject: { examId } };
    }
    if (status) {
      topicWhere.progress = { status };
    }

    let orderBy: any = {};
    if (sortBy === 'RECENTLY_STUDIED') {
      orderBy = { progress: { lastStudiedAt: 'desc' } };
    } else if (sortBy === 'RECENTLY_COMPLETED') {
      orderBy = { progress: { completedAt: 'desc' } };
    } else if (sortBy === 'LEAST_STUDIED') {
      orderBy = { progress: { totalStudyTimeSec: 'asc' } };
    } else if (sortBy === 'MOST_STUDIED') {
      orderBy = { progress: { totalStudyTimeSec: 'desc' } };
    } else if (sortBy === 'ALPHABETICAL') {
      orderBy = { name: 'asc' };
    }

    const [total, topics] = await Promise.all([
      this.prisma.topic.count({ where: topicWhere }),
      this.prisma.topic.findMany({
        where: topicWhere,
        skip,
        take: limit,
        orderBy,
        include: {
          progress: true,
          chapter: {
            select: {
              id: true,
              name: true,
              subject: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    const data: TopicProgressSummaryItem[] = topics.map((t) => ({
      id: t.id,
      name: t.name,
      subjectId: t.chapter?.subject?.id || '',
      subjectName: t.chapter?.subject?.name || 'Unassigned',
      chapterId: t.chapterId,
      chapterName: t.chapter?.name || 'Unassigned',
      status: (t.progress?.status as ProgressStatus) || ProgressStatus.NOT_STARTED,
      confidenceScore: t.progress?.confidenceScore || 1,
      totalStudyTimeSec: t.progress?.totalStudyTimeSec || 0,
      lastStudiedAt: t.progress?.lastStudiedAt
        ? this.activityService.formatLocalDate(t.progress.lastStudiedAt, timezone)
        : null,
      completedAt: t.progress?.completedAt
        ? this.activityService.formatLocalDate(t.progress.completedAt, timezone)
        : null,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Helper to retrieve quick actions context (active session / last studied topic).
   */
  public async getQuickActionsContext(
    userId: string,
    examId?: string,
  ): Promise<QuickActionsContextResponse> {
    const activeSession = await this.prisma.studySession.findFirst({
      where: {
        userId,
        status: { in: [SessionStatus.ACTIVE, SessionStatus.PAUSED] },
        ...(examId ? { examId } : {}),
      },
      select: { id: true },
    });

    let lastTopic: { id: string; name: string; subjectName?: string } | null = null;

    const lastSession = await this.prisma.studySession.findFirst({
      where: {
        userId,
        status: SessionStatus.COMPLETED,
        ...(examId ? { examId } : {}),
      },
      orderBy: { endedAt: 'desc' },
      select: {
        topic: {
          select: {
            id: true,
            name: true,
            chapter: { select: { subject: { select: { name: true } } } },
          },
        },
      },
    });

    if (lastSession?.topic) {
      lastTopic = {
        id: lastSession.topic.id,
        name: lastSession.topic.name,
        subjectName: lastSession.topic.chapter?.subject?.name,
      };
    }

    return {
      activeSessionId: activeSession?.id || null,
      lastStudiedTopic: lastTopic,
    };
  }

  /**
   * Period summary metrics (Weekly / Monthly) with neutral comparisons.
   */
  public async getPeriodSummary(
    userId: string,
    examId: string | undefined,
    periodDays: number,
    timezone: string = 'UTC',
  ): Promise<SummaryPeriodMetric> {
    const todayStr = this.activityService.getTodayLocalDate(timezone);
    const startDateStr = this.activityService.shiftLocalDate(todayStr, -(periodDays - 1));

    const prevEndDateStr = this.activityService.shiftLocalDate(startDateStr, -1);
    const prevStartDateStr = this.activityService.shiftLocalDate(prevEndDateStr, -(periodDays - 1));

    const sessionWhere: any = {
      userId,
      status: SessionStatus.COMPLETED,
    };
    if (examId) {
      sessionWhere.examId = examId;
    }

    const sessions = await this.prisma.studySession.findMany({
      where: sessionWhere,
      select: {
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
      },
    });

    let currentSeconds = 0;
    let previousSeconds = 0;
    let currentSessionsCount = 0;
    const currentActiveDaysSet = new Set<string>();

    for (const s of sessions) {
      const splitMap = this.activityService.splitSessionByLocalDate(s, timezone);
      for (const [dStr, sec] of splitMap.entries()) {
        if (dStr >= startDateStr && dStr <= todayStr) {
          currentSeconds += sec;
          currentSessionsCount++;
          if (sec >= MIN_STUDY_SECONDS_FOR_ACTIVITY) {
            currentActiveDaysSet.add(dStr);
          }
        } else if (dStr >= prevStartDateStr && dStr <= prevEndDateStr) {
          previousSeconds += sec;
        }
      }
    }

    // Topics completed count in current vs previous period
    const topicWhere: any = { userId, status: ProgressStatus.COMPLETED, completedAt: { not: null } };
    if (examId) {
      topicWhere.topic = { chapter: { subject: { examId } } };
    }

    const completedTopics = await this.prisma.topicProgress.findMany({
      where: topicWhere,
      select: { completedAt: true },
    });

    let currentTopicsCompleted = 0;
    let previousTopicsCompleted = 0;

    for (const t of completedTopics) {
      if (t.completedAt) {
        const dStr = this.activityService.formatLocalDate(t.completedAt, timezone);
        if (dStr >= startDateStr && dStr <= todayStr) {
          currentTopicsCompleted++;
        } else if (dStr >= prevStartDateStr && dStr <= prevEndDateStr) {
          previousTopicsCompleted++;
        }
      }
    }

    const activeDaysCount = currentActiveDaysSet.size;
    const avgSecPerActiveDay =
      activeDaysCount > 0 ? Math.round(currentSeconds / activeDaysCount) : 0;

    const diffSec = currentSeconds - previousSeconds;
    const diffFormatted = this.formatDuration(Math.abs(diffSec));
    const sign = diffSec >= 0 ? '+' : '-';

    const comparisonText =
      diffSec >= 0
        ? `Study time increased by ${diffFormatted} compared with previous ${periodDays}-day period.`
        : `Study time decreased by ${diffFormatted} compared with previous ${periodDays}-day period.`;

    const comparison: ComparisonMetric = {
      currentValue: currentSeconds,
      previousValue: previousSeconds,
      difference: diffSec,
      formattedDifference: `${sign}${diffFormatted}`,
      text: comparisonText,
    };

    return {
      studySeconds: currentSeconds,
      activeDays: activeDaysCount,
      totalDays: periodDays,
      topicsCompleted: currentTopicsCompleted,
      sessionsCount: currentSessionsCount,
      averageStudySecondsPerActiveDay: avgSecPerActiveDay,
      comparisonWithPrevious: comparison,
    };
  }
}
