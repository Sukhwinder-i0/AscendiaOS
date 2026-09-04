import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SyllabusService } from './syllabus.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  CreateSubjectSchema,
  CreateChapterSchema,
  CreateTopicSchema,
  UpdateNodeSchema,
  MoveTopicSchema,
  ReorderSchema,
  UpdateTopicProgressSchema,
  UserPayload,
  SyllabusTreeResponse,
} from '@studyos/shared';

@UseGuards(JwtAuthGuard)
@Controller()
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  @Get('exams/:examId/syllabus')
  async getSyllabusTree(
    @CurrentUser() user: UserPayload,
    @Param('examId') examId: string,
  ): Promise<SyllabusTreeResponse> {
    return this.syllabusService.getSyllabusTree(user.id, examId);
  }

  // Subject endpoints
  @Post('exams/:examId/subjects')
  async createSubject(
    @CurrentUser() user: UserPayload,
    @Param('examId') examId: string,
    @Body() body: unknown,
  ) {
    const dto = CreateSubjectSchema.parse(body);
    return this.syllabusService.createSubject(user.id, examId, dto);
  }

  @Patch('subjects/:id')
  async updateSubject(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = UpdateNodeSchema.parse(body);
    return this.syllabusService.updateSubject(user.id, id, dto);
  }

  @Delete('subjects/:id')
  async deleteSubject(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.syllabusService.deleteSubject(user.id, id);
  }

  // Chapter endpoints
  @Post('subjects/:subjectId/chapters')
  async createChapter(
    @CurrentUser() user: UserPayload,
    @Param('subjectId') subjectId: string,
    @Body() body: unknown,
  ) {
    const dto = CreateChapterSchema.parse(body);
    return this.syllabusService.createChapter(user.id, subjectId, dto);
  }

  @Patch('chapters/:id')
  async updateChapter(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = UpdateNodeSchema.parse(body);
    return this.syllabusService.updateChapter(user.id, id, dto);
  }

  @Delete('chapters/:id')
  async deleteChapter(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.syllabusService.deleteChapter(user.id, id);
  }

  // Topic endpoints
  @Post('chapters/:chapterId/topics')
  async createTopic(
    @CurrentUser() user: UserPayload,
    @Param('chapterId') chapterId: string,
    @Body() body: unknown,
  ) {
    const dto = CreateTopicSchema.parse(body);
    return this.syllabusService.createTopic(user.id, chapterId, dto);
  }

  @Patch('topics/:id')
  async updateTopic(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = UpdateNodeSchema.parse(body);
    return this.syllabusService.updateTopic(user.id, id, dto);
  }

  @Post('topics/:id/move')
  async moveTopic(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = MoveTopicSchema.parse(body);
    return this.syllabusService.moveTopic(user.id, id, dto);
  }

  @Delete('topics/:id')
  async deleteTopic(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.syllabusService.deleteTopic(user.id, id);
  }

  // Batch reorder endpoint
  @Post('syllabus/reorder')
  async reorderSyllabus(@CurrentUser() user: UserPayload, @Body() body: unknown) {
    const dto = ReorderSchema.parse(body);
    return this.syllabusService.reorderSyllabus(user.id, dto);
  }

  // Topic progress endpoint
  @Patch('topics/:id/progress')
  async updateTopicProgress(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = UpdateTopicProgressSchema.parse(body);
    return this.syllabusService.updateTopicProgress(user.id, id, dto);
  }
}
