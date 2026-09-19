import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateNoteDto,
  UpdateNoteDto,
  MoveNoteDto,
  NoteQueryDto,
  AttachResourceToNoteDto,
  NoteResponse,
} from '@studyos/shared';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private readonly db: DatabaseService) {}

  async createNote(userId: string, dto: CreateNoteDto): Promise<NoteResponse> {
    const targetLocation = await this.resolveAndValidateLocation(userId, dto);

    let initialContent = dto.content || '';
    if (dto.template && !initialContent) {
      initialContent = this.getTemplateContent(dto.template, dto.title);
    }

    const note = await this.db.note.create({
      data: {
        userId,
        title: dto.title,
        content: initialContent,
        contentFormat: dto.contentFormat || 'MARKDOWN',
        examId: targetLocation.examId,
        subjectId: targetLocation.subjectId,
        chapterId: targetLocation.chapterId,
        topicId: targetLocation.topicId,
      },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        resources: {
          include: {
            resource: {
              include: {
                exam: { select: { id: true, title: true } },
                subject: { select: { id: true, name: true } },
                chapter: { select: { id: true, name: true } },
                topic: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    return this.mapToResponse(note);
  }

  async getNotes(
    userId: string,
    query: NoteQueryDto,
  ): Promise<{ items: NoteResponse[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.examId) where.examId = query.examId;
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.chapterId) where.chapterId = query.chapterId;
    if (query.topicId) where.topicId = query.topicId;

    if (query.isPinned !== undefined) where.isPinned = query.isPinned;
    if (query.isArchived !== undefined) where.isArchived = query.isArchived;

    const [notes, total] = await Promise.all([
      this.db.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        include: {
          exam: { select: { id: true, title: true } },
          subject: { select: { id: true, name: true } },
          chapter: { select: { id: true, name: true } },
          topic: { select: { id: true, name: true } },
          resources: {
            include: {
              resource: true,
            },
          },
        },
      }),
      this.db.note.count({ where }),
    ]);

    return {
      items: notes.map((n) => this.mapToResponse(n)),
      total,
      page,
      limit,
    };
  }

  async getNoteById(userId: string, id: string): Promise<NoteResponse> {
    const note = await this.db.note.findFirst({
      where: { id, userId },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        resources: {
          include: {
            resource: {
              include: {
                exam: { select: { id: true, title: true } },
                subject: { select: { id: true, name: true } },
                chapter: { select: { id: true, name: true } },
                topic: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found or access denied');
    }

    return this.mapToResponse(note);
  }

  async updateNote(userId: string, id: string, dto: UpdateNoteDto): Promise<NoteResponse> {
    const existing = await this.db.note.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Note not found');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.contentFormat !== undefined) data.contentFormat = dto.contentFormat;
    if (dto.isPinned !== undefined) data.isPinned = dto.isPinned;
    if (dto.isArchived !== undefined) data.isArchived = dto.isArchived;

    const updated = await this.db.note.update({
      where: { id },
      data,
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        resources: {
          include: {
            resource: {
              include: {
                exam: { select: { id: true, title: true } },
                subject: { select: { id: true, name: true } },
                chapter: { select: { id: true, name: true } },
                topic: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    return this.mapToResponse(updated);
  }

  async togglePin(userId: string, id: string, isPinned?: boolean): Promise<NoteResponse> {
    const existing = await this.db.note.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Note not found');
    }

    const targetPinned = isPinned !== undefined ? isPinned : !existing.isPinned;
    return this.updateNote(userId, id, { isPinned: targetPinned });
  }

  async toggleArchive(userId: string, id: string, isArchived?: boolean): Promise<NoteResponse> {
    const existing = await this.db.note.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Note not found');
    }

    const targetArchived = isArchived !== undefined ? isArchived : !existing.isArchived;
    return this.updateNote(userId, id, { isArchived: targetArchived });
  }

  async moveNote(userId: string, id: string, dto: MoveNoteDto): Promise<NoteResponse> {
    const existing = await this.db.note.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Note not found');
    }

    const targetLocation = await this.resolveAndValidateLocation(userId, dto);

    const updated = await this.db.note.update({
      where: { id },
      data: {
        examId: targetLocation.examId,
        subjectId: targetLocation.subjectId,
        chapterId: targetLocation.chapterId,
        topicId: targetLocation.topicId,
      },
      include: {
        exam: { select: { id: true, title: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        resources: {
          include: {
            resource: true,
          },
        },
      },
    });

    return this.mapToResponse(updated);
  }

  async attachResource(userId: string, noteId: string, dto: AttachResourceToNoteDto): Promise<NoteResponse> {
    const note = await this.db.note.findFirst({ where: { id: noteId, userId } });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const resource = await this.db.resource.findFirst({ where: { id: dto.resourceId, userId } });
    if (!resource) {
      throw new ForbiddenException('Resource not found or access denied');
    }

    // Attach via join table if not already attached
    await this.db.noteResource.upsert({
      where: {
        noteId_resourceId: {
          noteId,
          resourceId: dto.resourceId,
        },
      },
      create: {
        noteId,
        resourceId: dto.resourceId,
      },
      update: {},
    });

    return this.getNoteById(userId, noteId);
  }

  async detachResource(userId: string, noteId: string, resourceId: string): Promise<NoteResponse> {
    const note = await this.db.note.findFirst({ where: { id: noteId, userId } });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    try {
      await this.db.noteResource.delete({
        where: {
          noteId_resourceId: {
            noteId,
            resourceId,
          },
        },
      });
    } catch {
      // Ignore if relationship was already deleted
    }

    return this.getNoteById(userId, noteId);
  }

  async deleteNote(userId: string, id: string): Promise<{ success: boolean }> {
    const existing = await this.db.note.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new NotFoundException('Note not found');
    }

    await this.db.note.delete({ where: { id } });
    return { success: true };
  }

  private async resolveAndValidateLocation(
    userId: string,
    dto: {
      examId?: string | null;
      subjectId?: string | null;
      chapterId?: string | null;
      topicId?: string | null;
    },
  ): Promise<{
    examId: string | null;
    subjectId: string | null;
    chapterId: string | null;
    topicId: string | null;
  }> {
    let topicId = dto.topicId || null;
    let chapterId = dto.chapterId || null;
    let subjectId = dto.subjectId || null;
    let examId = dto.examId || null;

    if (topicId) {
      const topic = await this.db.topic.findFirst({
        where: { id: topicId, userId },
        include: {
          chapter: {
            include: {
              subject: true,
            },
          },
        },
      });
      if (!topic) {
        throw new ForbiddenException('Topic not found or access denied');
      }
      chapterId = topic.chapterId;
      subjectId = topic.chapter.subjectId;
      examId = topic.chapter.subject.examId;
      return { examId, subjectId, chapterId, topicId };
    }

    if (chapterId) {
      const chapter = await this.db.chapter.findFirst({
        where: { id: chapterId, userId },
        include: { subject: true },
      });
      if (!chapter) {
        throw new ForbiddenException('Chapter not found or access denied');
      }
      subjectId = chapter.subjectId;
      examId = chapter.subject.examId;
      return { examId, subjectId, chapterId, topicId: null };
    }

    if (subjectId) {
      const subject = await this.db.subject.findFirst({
        where: { id: subjectId, userId },
      });
      if (!subject) {
        throw new ForbiddenException('Subject not found or access denied');
      }
      examId = subject.examId;
      return { examId, subjectId, chapterId: null, topicId: null };
    }

    if (examId) {
      const exam = await this.db.exam.findFirst({
        where: { id: examId, userId },
      });
      if (!exam) {
        throw new ForbiddenException('Exam not found or access denied');
      }
      return { examId, subjectId: null, chapterId: null, topicId: null };
    }

    return { examId: null, subjectId: null, chapterId: null, topicId: null };
  }

  private getTemplateContent(templateName: string, title: string): string {
    const topicHeader = title || 'Topic';
    switch (templateName) {
      case 'FORMULA_SHEET':
        return `# ${topicHeader} — Formula Sheet\n\n## Key Formulas\n\n$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$\n\n## Variables & Notation\n- **P(A)**: Probability of event A\n- **P(B)**: Probability of event B\n\n## Conditions & Prerequisites\n- $P(B) > 0$\n\n## Solved Example\n\n## Common Mistakes & Edge Cases\n`;
      case 'CONCEPT_SUMMARY':
        return `# ${topicHeader} — Concept Summary\n\n## Overview & Core Idea\n\n## Key Definitions\n\n## Main Principles\n\n## Takeaways\n`;
      case 'MISTAKE_LOG':
        return `# ${topicHeader} — Mistake Log\n\n## Problem Statement\n\n## My Initial Wrong Approach\n\n## Correct Solution & Explanation\n\n## Core Takeaway / Prevention Rule\n`;
      case 'REVISION_NOTES':
        return `# ${topicHeader} — 30-Second Revision Notes\n\n## High-Yield Points\n- Point 1\n- Point 2\n\n## Must-Remember Equations\n\n## Memory Anchors\n`;
      default:
        return `# ${topicHeader}\n\nStart writing your study notes here...\n`;
    }
  }

  private mapToResponse(note: any): NoteResponse {
    const rawContent = note.content || '';
    const snippet = rawContent
      .replace(/#+/g, '')
      .replace(/\*+/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 160);

    const mappedResources = (note.resources || []).map((nr: any) => {
      const res = nr.resource || nr;
      return {
        id: res.id,
        userId: res.userId,
        locationType: res.locationType,
        type: res.type,
        title: res.title,
        description: res.description,
        url: res.url,
        filename: res.filename,
        mimeType: res.mimeType,
        sizeBytes: res.sizeBytes,
        storageKey: res.storageKey,
        thumbnailUrl: res.thumbnailUrl,
        status: res.status,
        provider: res.provider,
        externalId: res.externalId,
        metadata: res.metadata,
        isCompleted: res.isCompleted,
        completedAt: res.completedAt ? res.completedAt.toISOString() : null,
        examId: res.examId,
        subjectId: res.subjectId,
        chapterId: res.chapterId,
        topicId: res.topicId,
        exam: res.exam ? { id: res.exam.id, title: res.exam.title } : null,
        subject: res.subject ? { id: res.subject.id, name: res.subject.name } : null,
        chapter: res.chapter ? { id: res.chapter.id, name: res.chapter.name } : null,
        topic: res.topic ? { id: res.topic.id, name: res.topic.name } : null,
        createdAt: res.createdAt ? res.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: res.updatedAt ? res.updatedAt.toISOString() : new Date().toISOString(),
      };
    });

    return {
      id: note.id,
      userId: note.userId,
      title: note.title,
      content: note.content,
      contentFormat: note.contentFormat,
      isPinned: note.isPinned,
      isArchived: note.isArchived,
      examId: note.examId,
      subjectId: note.subjectId,
      chapterId: note.chapterId,
      topicId: note.topicId,
      exam: note.exam ? { id: note.exam.id, title: note.exam.title } : null,
      subject: note.subject ? { id: note.subject.id, name: note.subject.name } : null,
      chapter: note.chapter ? { id: note.chapter.id, name: note.chapter.name } : null,
      topic: note.topic ? { id: note.topic.id, name: note.topic.name } : null,
      resources: mappedResources,
      snippet: snippet ? `${snippet}...` : '',
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }
}
