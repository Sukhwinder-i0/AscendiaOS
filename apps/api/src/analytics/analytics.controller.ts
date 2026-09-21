import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsDashboardQueryDto,
  TopicProgressQueryDto,
  TrendPeriod,
} from '@studyos/shared';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardData(
    @CurrentUser() user: any,
    @Query() query: AnalyticsDashboardQueryDto,
  ) {
    return this.analyticsService.getDashboardData(user.id, query);
  }

  @Get('subjects/:id')
  async getSubjectDetailAnalytics(
    @CurrentUser() user: any,
    @Param('id') subjectId: string,
    @Query('timezone') timezone?: string,
  ) {
    return this.analyticsService.getSubjectDetailAnalytics(
      user.id,
      subjectId,
      timezone || 'UTC',
    );
  }

  @Get('topic-progress')
  async getTopicProgressOverview(
    @CurrentUser() user: any,
    @Query() query: TopicProgressQueryDto,
    @Query('timezone') timezone?: string,
  ) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    return this.analyticsService.getTopicProgressOverview(
      user.id,
      { ...query, page, limit },
      timezone || 'UTC',
    );
  }

  @Get('recent-activity')
  async getRecentActivity(
    @CurrentUser() user: any,
    @Query('examId') examId?: string,
    @Query('timezone') timezone?: string,
  ) {
    return this.analyticsService.getRecentActivityTimeline(
      user.id,
      examId,
      timezone || 'UTC',
    );
  }

  @Get('study-trend')
  async getStudyTrend(
    @CurrentUser() user: any,
    @Query('examId') examId?: string,
    @Query('period') period?: TrendPeriod,
    @Query('timezone') timezone?: string,
  ) {
    return this.analyticsService.getStudyTrend(
      user.id,
      examId,
      period || '30d',
      timezone || 'UTC',
    );
  }
}
