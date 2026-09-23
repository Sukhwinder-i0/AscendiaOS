import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateStudySessionDto,
  FinishStudySessionDto,
  StudySessionQueryDto,
  SessionStatus,
  SessionType,
  ProgressStatus,
  DailySummaryResponse,
} from '@ascendiaos/shared';

@Injectable()
export class StudySessionsService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------
  // HELPERS & DURATION CALCULATION
  // -------------------------------------------------------------------
  private calculateActiveDuration(session: {
    status: string;
    startedAt: Date | null;
    endedAt: Date | null;
    lastPausedAt: Date | null;
    totalPauseSeconds: number;
    durationSeconds: number;
  }): number {
    if (session.status === SessionStatus.COMPLETED) {
      return session.durationSeconds;
    }
    if (session.status === SessionStatus.CREATED || !session.startedAt) {
      return 0;
    }

    const now = session.endedAt ? new Date(session.endedAt) : new Date();
    let additionalPauseSec = 0;
    if (session.status === SessionStatus.PAUSED && session.lastPausedAt) {
      additionalPauseSec = Math.floor(
        (now.getTime() - new Date(session.lastPausedAt).getTime()) / 1000,
      );
    }

    const totalElapsedSec = Math.floor(
      (now.getTime() - new Date(session.startedAt).getTime()) / 1000,
    );
    const netSeconds = Math.max(
      0,
      totalElapsedSec - session.totalPauseSeconds - additionalPauseSec,
    );
    return netSeconds;
  }

  // -------------------------------------------------------------------
  // CREATE SESSION
  // -------------------------------------------------------------------
  async createSession(userId: string, dto: CreateStudySessionDto) {
    // Check for existing active/paused session
    const existingActive = await this.getActiveSession(userId);
    if (existingActive) {
      throw new ConflictException({
        message: 'You already have an active study session.',
        activeSession: existingActive,
      });
    }

    // Verify topic existence and ownership
    const topic = await this.prisma.topic.findUnique({
      where: { id: dto.topicId },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!topic || topic.userId !== userId) {
      throw new NotFoundException('Topic not found');
    }

    const chapter = topic.chapter;
    const subject = chapter.subject;

    // Create session record
    const session = await this.prisma.studySession.create({
      data: {
        userId,
        topicId: topic.id,
        chapterId: chapter.id,
        subjectId: subject.id,
        examId: subject.examId,
        sessionType: (dto.sessionType as any) || SessionType.LEARNING,
        status: SessionStatus.CREATED,
        goal: dto.goal || null,
      },
      include: {
        topic: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    return {
      ...session,
      startedAt: session.startedAt?.toISOString() || null,
      endedAt: session.endedAt?.toISOString() || null,
      lastPausedAt: session.lastPausedAt?.toISOString() || null,
      activeDurationSeconds: 0,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  // -------------------------------------------------------------------
  // START SESSION
  // -------------------------------------------------------------------
  async startSession(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Study session not found');
    }

    if (session.status !== SessionStatus.CREATED) {
      throw new BadRequestException(
        `Cannot start session in status '${session.status}'`,
      );
    }

    // Double check active rule
    const existingActive = await this.getActiveSession(userId);
    if (existingActive && existingActive.id !== sessionId) {
      throw new ConflictException({
        message: 'You already have another active study session running.',
        activeSession: existingActive,
      });
    }

    const now = new Date();
    const updated = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.ACTIVE,
        startedAt: now,
      },
      include: {
        topic: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    return {
      ...updated,
      startedAt: updated.startedAt?.toISOString() || null,
      endedAt: updated.endedAt?.toISOString() || null,
      lastPausedAt: updated.lastPausedAt?.toISOString() || null,
      activeDurationSeconds: this.calculateActiveDuration(updated),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  // -------------------------------------------------------------------
  // PAUSE SESSION
  // -------------------------------------------------------------------
  async pauseSession(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Study session not found');
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot pause session in status '${session.status}'`,
      );
    }

    const now = new Date();
    const updated = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.PAUSED,
        lastPausedAt: now,
      },
      include: {
        topic: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    return {
      ...updated,
      startedAt: updated.startedAt?.toISOString() || null,
      endedAt: updated.endedAt?.toISOString() || null,
      lastPausedAt: updated.lastPausedAt?.toISOString() || null,
      activeDurationSeconds: this.calculateActiveDuration(updated),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  // -------------------------------------------------------------------
  // RESUME SESSION
  // -------------------------------------------------------------------
  async resumeSession(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Study session not found');
    }

    if (session.status !== SessionStatus.PAUSED) {
      throw new BadRequestException(
        `Cannot resume session in status '${session.status}'`,
      );
    }

    const now = new Date();
    let pauseIncrement = 0;
    if (session.lastPausedAt) {
      pauseIncrement = Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(session.lastPausedAt).getTime()) / 1000,
        ),
      );
    }

    const updated = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.ACTIVE,
        lastPausedAt: null,
        totalPauseSeconds: session.totalPauseSeconds + pauseIncrement,
      },
      include: {
        topic: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    return {
      ...updated,
      startedAt: updated.startedAt?.toISOString() || null,
      endedAt: updated.endedAt?.toISOString() || null,
      lastPausedAt: updated.lastPausedAt?.toISOString() || null,
      activeDurationSeconds: this.calculateActiveDuration(updated),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  // -------------------------------------------------------------------
  // FINISH SESSION
  // -------------------------------------------------------------------
  async finishSession(
    userId: string,
    sessionId: string,
    dto?: FinishStudySessionDto,
  ) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Study session not found');
    }

    if (
      session.status !== SessionStatus.ACTIVE &&
      session.status !== SessionStatus.PAUSED
    ) {
      throw new BadRequestException(
        `Cannot finish session in status '${session.status}'`,
      );
    }

    const now = new Date();
    let additionalPauseSec = 0;
    if (session.status === SessionStatus.PAUSED && session.lastPausedAt) {
      additionalPauseSec = Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(session.lastPausedAt).getTime()) / 1000,
        ),
      );
    }

    const totalPauseSec = session.totalPauseSeconds + additionalPauseSec;
    const startedAt = session.startedAt ? new Date(session.startedAt) : now;
    const totalElapsedSec = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    const finalDurationSec = Math.max(0, totalElapsedSec - totalPauseSec);

    // Save finished session & update TopicProgress transactionally
    const updatedSession = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        endedAt: now,
        totalPauseSeconds: totalPauseSec,
        durationSeconds: finalDurationSec,
        reflection: dto?.reflection || null,
        confidence: dto?.confidence || null,
        difficulty: dto?.difficulty || null,
      },
      include: {
        topic: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    // Update TopicProgress
    const topicProgress = await this.prisma.topicProgress.findUnique({
      where: { topicId: session.topicId },
    });

    const currentStatus = topicProgress?.status || ProgressStatus.NOT_STARTED;
    let newStatus = currentStatus;
    if (dto?.markTopicCompleted) {
      newStatus = ProgressStatus.COMPLETED;
    } else if (currentStatus === ProgressStatus.NOT_STARTED) {
      newStatus = ProgressStatus.LEARNING;
    }

    await this.prisma.topicProgress.upsert({
      where: { topicId: session.topicId },
      update: {
        totalStudyTimeSec: { increment: finalDurationSec },
        sessionCount: { increment: 1 },
        lastStudiedAt: now,
        status: newStatus as any,
        ...(dto?.confidence && { confidenceScore: dto.confidence }),
        ...(dto?.markTopicCompleted && { completedAt: now }),
      },
      create: {
        userId,
        topicId: session.topicId,
        totalStudyTimeSec: finalDurationSec,
        sessionCount: 1,
        lastStudiedAt: now,
        status: newStatus as any,
        confidenceScore: dto?.confidence || 1,
        ...(dto?.markTopicCompleted && { completedAt: now }),
      },
    });

    return {
      ...updatedSession,
      startedAt: updatedSession.startedAt?.toISOString() || null,
      endedAt: updatedSession.endedAt?.toISOString() || null,
      lastPausedAt: updatedSession.lastPausedAt?.toISOString() || null,
      activeDurationSeconds: finalDurationSec,
      createdAt: updatedSession.createdAt.toISOString(),
      updatedAt: updatedSession.updatedAt.toISOString(),
    };
  }

  // -------------------------------------------------------------------
  // DISCARD SESSION
  // -------------------------------------------------------------------
  async discardSession(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Study session not found');
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new BadRequestException('Cannot discard a completed session');
    }

    const updated = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.DISCARDED },
    });

    return { success: true, id: updated.id };
  }

  // -------------------------------------------------------------------
  // GET ACTIVE SESSION (FOR RECOVERY)
  // -------------------------------------------------------------------
  async getActiveSession(userId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: {
        userId,
        status: { in: [SessionStatus.ACTIVE, SessionStatus.PAUSED] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        topic: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    if (!session) return null;

    return {
      ...session,
      startedAt: session.startedAt?.toISOString() || null,
      endedAt: session.endedAt?.toISOString() || null,
      lastPausedAt: session.lastPausedAt?.toISOString() || null,
      activeDurationSeconds: this.calculateActiveDuration(session),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  // -------------------------------------------------------------------
  // GET SINGLE SESSION BY ID
  // -------------------------------------------------------------------
  async getSessionById(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
      include: {
        topic: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Study session not found');
    }

    return {
      ...session,
      startedAt: session.startedAt?.toISOString() || null,
      endedAt: session.endedAt?.toISOString() || null,
      lastPausedAt: session.lastPausedAt?.toISOString() || null,
      activeDurationSeconds: this.calculateActiveDuration(session),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  // -------------------------------------------------------------------
  // LIST SESSIONS HISTORY WITH FILTERS
  // -------------------------------------------------------------------
  async listSessions(userId: string, query: StudySessionQueryDto) {
    const {
      topicId,
      subjectId,
      examId,
      sessionType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (topicId) where.topicId = topicId;
    if (subjectId) where.subjectId = subjectId;
    if (examId) where.examId = examId;
    if (sessionType) where.sessionType = sessionType;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [total, sessions] = await Promise.all([
      this.prisma.studySession.count({ where }),
      this.prisma.studySession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          topic: { select: { id: true, name: true } },
          chapter: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
          exam: { select: { id: true, title: true } },
        },
      }),
    ]);

    const formattedSessions = sessions.map((s) => ({
      ...s,
      startedAt: s.startedAt?.toISOString() || null,
      endedAt: s.endedAt?.toISOString() || null,
      lastPausedAt: s.lastPausedAt?.toISOString() || null,
      activeDurationSeconds: this.calculateActiveDuration(s),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return {
      data: formattedSessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // -------------------------------------------------------------------
  // DAILY SUMMARY AGGREGATIONS
  // -------------------------------------------------------------------
  async getDailySummary(
    userId: string,
    dateStr?: string,
    timezone: string = 'UTC',
  ): Promise<DailySummaryResponse> {
    const targetDate = dateStr ? new Date(dateStr) : new Date();

    // Calculate start and end of day in target timezone boundary
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await this.prisma.studySession.findMany({
      where: {
        userId,
        status: SessionStatus.COMPLETED,
        endedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        subject: { select: { id: true, name: true, colorHex: true } },
        topic: { select: { id: true } },
      },
    });

    let totalStudySeconds = 0;
    const studiedTopicIds = new Set<string>();
    const subjectMap = new Map<
      string,
      { id: string; name: string; colorHex?: string | null; durationSeconds: number }
    >();

    for (const s of sessions) {
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

    // Count topics marked COMPLETED on this day
    const completedTopicsCount = await this.prisma.topicProgress.count({
      where: {
        userId,
        status: ProgressStatus.COMPLETED,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return {
      date: targetDate.toISOString().split('T')[0],
      timezone,
      totalStudySeconds,
      sessionCount: sessions.length,
      topicsStudiedCount: studiedTopicIds.size,
      topicsCompletedCount: completedTopicsCount,
      subjectsStudied: Array.from(subjectMap.values()),
    };
  }
}
