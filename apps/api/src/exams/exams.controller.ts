import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateExamSchema, UpdateExamSchema, UserPayload, ExamResponse } from '@studyos/shared';

@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body() body: unknown,
  ): Promise<ExamResponse> {
    const dto = CreateExamSchema.parse(body);
    return this.examsService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: UserPayload): Promise<ExamResponse[]> {
    return this.examsService.findAllForUser(user.id);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ): Promise<ExamResponse> {
    return this.examsService.findOne(user.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<ExamResponse> {
    const dto = UpdateExamSchema.parse(body);
    return this.examsService.update(user.id, id, dto);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.examsService.remove(user.id, id);
  }
}
