import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudySessionsService } from './study-sessions.service';
import {
  CreateStudySessionSchema,
  FinishStudySessionSchema,
  StudySessionQuerySchema,
} from '@ascendiaos/shared';

@Controller('study-sessions')
@UseGuards(JwtAuthGuard)
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Post()
  async createSession(@Req() req: any, @Body() body: any) {
    const dto = CreateStudySessionSchema.parse(body);
    return this.studySessionsService.createSession(req.user.id, dto);
  }

  @Get('active')
  async getActiveSession(@Req() req: any) {
    return this.studySessionsService.getActiveSession(req.user.id);
  }

  @Get('summary/today')
  async getDailySummary(
    @Req() req: any,
    @Query('date') dateStr?: string,
    @Query('timezone') timezone?: string,
  ) {
    return this.studySessionsService.getDailySummary(
      req.user.id,
      dateStr,
      timezone || 'UTC',
    );
  }

  @Get()
  async listSessions(@Req() req: any, @Query() query: any) {
    const dto = StudySessionQuerySchema.parse(query);
    return this.studySessionsService.listSessions(req.user.id, dto);
  }

  @Get(':id')
  async getSessionById(@Req() req: any, @Param('id') id: string) {
    return this.studySessionsService.getSessionById(req.user.id, id);
  }

  @Post(':id/start')
  async startSession(@Req() req: any, @Param('id') id: string) {
    return this.studySessionsService.startSession(req.user.id, id);
  }

  @Post(':id/pause')
  async pauseSession(@Req() req: any, @Param('id') id: string) {
    return this.studySessionsService.pauseSession(req.user.id, id);
  }

  @Post(':id/resume')
  async resumeSession(@Req() req: any, @Param('id') id: string) {
    return this.studySessionsService.resumeSession(req.user.id, id);
  }

  @Post(':id/finish')
  async finishSession(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const dto = body ? FinishStudySessionSchema.parse(body) : undefined;
    return this.studySessionsService.finishSession(req.user.id, id, dto);
  }

  @Post(':id/discard')
  async discardSession(@Req() req: any, @Param('id') id: string) {
    return this.studySessionsService.discardSession(req.user.id, id);
  }
}
