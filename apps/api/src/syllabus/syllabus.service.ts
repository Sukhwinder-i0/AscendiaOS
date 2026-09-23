import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateSubjectDto,
  CreateChapterDto,
  CreateTopicDto,
  UpdateNodeDto,
  MoveTopicDto,
  ReorderSyllabusDto,
  UpdateTopicProgressDto,
  SyllabusTreeResponse,
  SubjectNode,
  ChapterNode,
  TopicNode,
  ProgressStatus,
} from '@ascendiaos/shared';

@Injectable()
export class SyllabusService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // TREE GETTER & AGGREGATOR
  // -------------------------------------------------------------
  async getSyllabusTree(userId: string, examId: string): Promise<SyllabusTreeResponse> {
    // 1. Verify exam ownership
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (exam.userId !== userId) {
      throw new ForbiddenException('Access denied to this exam');
    }

    // 2. Fetch subjects with nested chapters, topics & progress
    const subjectsRaw = await this.prisma.subject.findMany({
      where: { examId, userId },
      orderBy: { orderIndex: 'asc' },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            topics: {
              orderBy: { orderIndex: 'asc' },
              include: {
                progress: true,
              },
            },
          },
        },
      },
    });

    let totalSubjects = 0;
    let totalChapters = 0;
    let totalTopics = 0;
    let completedTopics = 0;

    const subjects: SubjectNode[] = subjectsRaw.map((sub) => {
      totalSubjects++;

      let subTotalTopics = 0;
      let subCompletedTopics = 0;

      const chapters: ChapterNode[] = sub.chapters.map((chap) => {
        totalChapters++;

        // Map flat topics list into nested hierarchy
        const rawTopics = chap.topics;
        const topicMap = new Map<string, TopicNode>();

        for (const t of rawTopics) {
          totalTopics++;
          subTotalTopics++;

          const isCompleted =
            t.progress?.status === ProgressStatus.COMPLETED ||
            t.progress?.status === ProgressStatus.MASTERED;

          if (isCompleted) {
            completedTopics++;
            subCompletedTopics++;
          }

          const node: TopicNode = {
            id: t.id,
            chapterId: t.chapterId,
            parentId: t.parentId,
            name: t.name,
            orderIndex: t.orderIndex,
            path: t.path || '',
            progress: {
              id: t.progress?.id || '',
              topicId: t.id,
              status: (t.progress?.status as ProgressStatus) || ProgressStatus.NOT_STARTED,
              confidenceScore: t.progress?.confidenceScore || 1,
              masteryScore: t.progress?.masteryScore || 0,
              totalStudyTimeSec: t.progress?.totalStudyTimeSec || 0,
              sessionCount: t.progress?.sessionCount || 0,
              lastStudiedAt: t.progress?.lastStudiedAt ? t.progress.lastStudiedAt.toISOString() : null,
              completedAt: t.progress?.completedAt ? t.progress.completedAt.toISOString() : null,
            },
            subtopics: [],
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
          };

          topicMap.set(t.id, node);
        }

        // Build tree roots
        const chapterTopicTree: TopicNode[] = [];
        let chapCompletedTopics = 0;

        for (const t of rawTopics) {
          const node = topicMap.get(t.id)!;
          if (
            node.progress.status === ProgressStatus.COMPLETED ||
            node.progress.status === ProgressStatus.MASTERED
          ) {
            chapCompletedTopics++;
          }

          if (t.parentId && topicMap.has(t.parentId)) {
            topicMap.get(t.parentId)!.subtopics.push(node);
          } else {
            chapterTopicTree.push(node);
          }
        }

        const chapTotalTopics = rawTopics.length;
        const chapProgressPercentage =
          chapTotalTopics > 0 ? Math.round((chapCompletedTopics / chapTotalTopics) * 100) : 0;

        return {
          id: chap.id,
          subjectId: chap.subjectId,
          name: chap.name,
          orderIndex: chap.orderIndex,
          topics: chapterTopicTree,
          progressPercentage: chapProgressPercentage,
          completedTopicsCount: chapCompletedTopics,
          totalTopicsCount: chapTotalTopics,
          createdAt: chap.createdAt.toISOString(),
          updatedAt: chap.updatedAt.toISOString(),
        };
      });

      const subProgressPercentage =
        subTotalTopics > 0 ? Math.round((subCompletedTopics / subTotalTopics) * 100) : 0;

      return {
        id: sub.id,
        examId: sub.examId,
        name: sub.name,
        code: sub.code,
        colorHex: sub.colorHex,
        orderIndex: sub.orderIndex,
        chapters,
        progressPercentage: subProgressPercentage,
        completedTopicsCount: subCompletedTopics,
        totalTopicsCount: subTotalTopics,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
      };
    });

    const overallProgressPercentage =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      examId,
      subjects,
      overallProgressPercentage,
      totalSubjects,
      totalChapters,
      totalTopics,
      completedTopics,
    };
  }

  // -------------------------------------------------------------
  // SUBJECT CRUD
  // -------------------------------------------------------------
  async createSubject(userId: string, examId: string, dto: CreateSubjectDto) {
    const maxOrder = await this.prisma.subject.aggregate({
      where: { examId },
      _max: { orderIndex: true },
    });

    return this.prisma.subject.create({
      data: {
        examId,
        userId,
        name: dto.name,
        code: dto.code,
        colorHex: dto.colorHex || '#3B82F6',
        orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
      },
    });
  }

  async updateSubject(userId: string, subjectId: string, dto: UpdateNodeDto) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || subject.userId !== userId) throw new NotFoundException('Subject not found');

    return this.prisma.subject.update({
      where: { id: subjectId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.colorHex && { colorHex: dto.colorHex }),
      },
    });
  }

  async deleteSubject(userId: string, subjectId: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || subject.userId !== userId) throw new NotFoundException('Subject not found');

    await this.prisma.subject.delete({ where: { id: subjectId } });
    return { success: true };
  }

  // -------------------------------------------------------------
  // CHAPTER CRUD
  // -------------------------------------------------------------
  async createChapter(userId: string, subjectId: string, dto: CreateChapterDto) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || subject.userId !== userId) throw new NotFoundException('Subject not found');

    const maxOrder = await this.prisma.chapter.aggregate({
      where: { subjectId },
      _max: { orderIndex: true },
    });

    return this.prisma.chapter.create({
      data: {
        subjectId,
        userId,
        name: dto.name,
        orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
      },
    });
  }

  async updateChapter(userId: string, chapterId: string, dto: UpdateNodeDto) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter || chapter.userId !== userId) throw new NotFoundException('Chapter not found');

    return this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        ...(dto.name && { name: dto.name }),
      },
    });
  }

  async deleteChapter(userId: string, chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter || chapter.userId !== userId) throw new NotFoundException('Chapter not found');

    await this.prisma.chapter.delete({ where: { id: chapterId } });
    return { success: true };
  }

  // -------------------------------------------------------------
  // TOPIC CRUD & MOVEMENT
  // -------------------------------------------------------------
  async createTopic(userId: string, chapterId: string, dto: CreateTopicDto) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter || chapter.userId !== userId) throw new NotFoundException('Chapter not found');

    if (dto.parentId) {
      const parent = await this.prisma.topic.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.userId !== userId) throw new NotFoundException('Parent topic not found');
    }

    const maxOrder = await this.prisma.topic.aggregate({
      where: { chapterId, parentId: dto.parentId || null },
      _max: { orderIndex: true },
    });

    const topic = await this.prisma.topic.create({
      data: {
        chapterId,
        userId,
        parentId: dto.parentId || null,
        name: dto.name,
        orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
        progress: {
          create: {
            userId,
            status: ProgressStatus.NOT_STARTED,
            confidenceScore: 1,
          },
        },
      },
      include: {
        progress: true,
      },
    });

    return topic;
  }

  async updateTopic(userId: string, topicId: string, dto: UpdateNodeDto) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic || topic.userId !== userId) throw new NotFoundException('Topic not found');

    return this.prisma.topic.update({
      where: { id: topicId },
      data: {
        ...(dto.name && { name: dto.name }),
      },
      include: {
        progress: true,
      },
    });
  }

  async moveTopic(userId: string, topicId: string, dto: MoveTopicDto) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic || topic.userId !== userId) throw new NotFoundException('Topic not found');

    const targetChapterId = dto.targetChapterId || topic.chapterId;
    const targetParentId = dto.targetParentId !== undefined ? dto.targetParentId : topic.parentId;

    if (targetParentId) {
      const parent = await this.prisma.topic.findUnique({ where: { id: targetParentId } });
      if (!parent || parent.userId !== userId) throw new NotFoundException('Target parent topic not found');
    }

    return this.prisma.topic.update({
      where: { id: topicId },
      data: {
        chapterId: targetChapterId,
        parentId: targetParentId,
      },
      include: {
        progress: true,
      },
    });
  }

  async deleteTopic(userId: string, topicId: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic || topic.userId !== userId) throw new NotFoundException('Topic not found');

    await this.prisma.topic.delete({ where: { id: topicId } });
    return { success: true };
  }

  // -------------------------------------------------------------
  // REORDERING & PROGRESS UPDATES
  // -------------------------------------------------------------
  async reorderSyllabus(userId: string, dto: ReorderSyllabusDto) {
    const { nodeType, nodeIdsInOrder } = dto;

    if (nodeType === 'SUBJECT') {
      await Promise.all(
        nodeIdsInOrder.map((id, index) =>
          this.prisma.subject.updateMany({
            where: { id, userId },
            data: { orderIndex: index },
          }),
        ),
      );
    } else if (nodeType === 'CHAPTER') {
      await Promise.all(
        nodeIdsInOrder.map((id, index) =>
          this.prisma.chapter.updateMany({
            where: { id, userId },
            data: { orderIndex: index },
          }),
        ),
      );
    } else if (nodeType === 'TOPIC') {
      await Promise.all(
        nodeIdsInOrder.map((id, index) =>
          this.prisma.topic.updateMany({
            where: { id, userId },
            data: { orderIndex: index },
          }),
        ),
      );
    }

    return { success: true };
  }

  async updateTopicProgress(userId: string, topicId: string, dto: UpdateTopicProgressDto) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: { progress: true },
    });

    if (!topic || topic.userId !== userId) throw new NotFoundException('Topic not found');

    const updatedProgress = await this.prisma.topicProgress.upsert({
      where: { topicId },
      update: {
        status: dto.status as any,
        ...(dto.confidenceScore && { confidenceScore: dto.confidenceScore }),
        lastStudiedAt: new Date(),
      },
      create: {
        topicId,
        userId,
        status: dto.status as any,
        confidenceScore: dto.confidenceScore || 1,
        lastStudiedAt: new Date(),
      },
    });

    return updatedProgress;
  }
}
