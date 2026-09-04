import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateExamDto, UpdateExamDto, ExamResponse } from '@studyos/shared';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExamDto): Promise<ExamResponse> {
    const exam = await this.prisma.exam.create({
      data: {
        userId,
        title: dto.title,
        code: dto.code,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        targetScore: dto.targetScore,
        targetRank: dto.targetRank,
        dailyGoalHours: dto.dailyGoalHours ?? 4.0,
      },
    });

    return this.mapExamToResponse(exam, 0, null);
  }

  async findAllForUser(userId: string): Promise<ExamResponse[]> {
    const exams = await this.prisma.exam.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: {
        subjects: {
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
          },
        },
      },
    });

    return exams.map((exam) => {
      let totalTopics = 0;
      let completedTopics = 0;

      for (const subject of exam.subjects) {
        for (const chapter of subject.chapters) {
          for (const topic of chapter.topics) {
            totalTopics++;
            if (topic.progress?.status === 'COMPLETED' || topic.progress?.status === 'MASTERED') {
              completedTopics++;
            }
          }
        }
      }

      const overallProgressPercentage =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      let daysRemaining: number | null = null;
      if (exam.targetDate) {
        const diffMs = new Date(exam.targetDate).getTime() - new Date().getTime();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      return this.mapExamToResponse(exam, overallProgressPercentage, daysRemaining);
    });
  }

  async findOne(userId: string, examId: string): Promise<ExamResponse> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        subjects: {
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
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.userId !== userId) {
      throw new ForbiddenException('Access denied to this exam');
    }

    let totalTopics = 0;
    let completedTopics = 0;

    for (const subject of exam.subjects) {
      for (const chapter of subject.chapters) {
        for (const topic of chapter.topics) {
          totalTopics++;
          if (topic.progress?.status === 'COMPLETED' || topic.progress?.status === 'MASTERED') {
            completedTopics++;
          }
        }
      }
    }

    const overallProgressPercentage =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    let daysRemaining: number | null = null;
    if (exam.targetDate) {
      const diffMs = new Date(exam.targetDate).getTime() - new Date().getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    return this.mapExamToResponse(exam, overallProgressPercentage, daysRemaining);
  }

  async update(userId: string, examId: string, dto: UpdateExamDto): Promise<ExamResponse> {
    await this.findOne(userId, examId); // verify ownership

    const updated = await this.prisma.exam.update({
      where: { id: examId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.targetDate !== undefined && {
          targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        }),
        ...(dto.targetScore !== undefined && { targetScore: dto.targetScore }),
        ...(dto.targetRank !== undefined && { targetRank: dto.targetRank }),
        ...(dto.dailyGoalHours !== undefined && { dailyGoalHours: dto.dailyGoalHours }),
      },
    });

    return this.findOne(userId, updated.id);
  }

  async remove(userId: string, examId: string): Promise<{ success: boolean }> {
    await this.findOne(userId, examId); // verify ownership

    await this.prisma.exam.delete({
      where: { id: examId },
    });

    return { success: true };
  }

  private mapExamToResponse(
    exam: any,
    overallProgressPercentage: number,
    daysRemaining: number | null,
  ): ExamResponse {
    return {
      id: exam.id,
      userId: exam.userId,
      title: exam.title,
      code: exam.code,
      targetDate: exam.targetDate ? exam.targetDate.toISOString() : null,
      targetScore: exam.targetScore,
      targetRank: exam.targetRank,
      dailyGoalHours: exam.dailyGoalHours,
      isArchived: exam.isArchived,
      createdAt: exam.createdAt.toISOString(),
      updatedAt: exam.updatedAt.toISOString(),
      overallProgressPercentage,
      daysRemaining,
    };
  }
}
