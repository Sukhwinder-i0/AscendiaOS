import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ActivityService } from './activity.service';
import {
  ActivityHeatmapQueryDto,
  ActivityHistoryQueryDto,
} from '@ascendiaos/shared';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('summary')
  async getActivitySummary(
    @CurrentUser() user: any,
    @Query('timezone') timezone?: string,
  ) {
    return this.activityService.getActivitySummary(user.id, timezone || 'UTC');
  }

  @Get('today')
  async getTodayActivity(
    @CurrentUser() user: any,
    @Query('timezone') timezone?: string,
  ) {
    const summary = await this.activityService.getActivitySummary(
      user.id,
      timezone || 'UTC',
    );
    return summary.today;
  }

  @Get('heatmap')
  async getHeatmap(
    @CurrentUser() user: any,
    @Query() query: ActivityHeatmapQueryDto,
  ) {
    return this.activityService.getHeatmap(
      user.id,
      query.from,
      query.to,
      query.timezone || 'UTC',
    );
  }

  @Get('streak')
  async getStreak(
    @CurrentUser() user: any,
    @Query('timezone') timezone?: string,
  ) {
    return this.activityService.getStreak(user.id, timezone || 'UTC');
  }

  @Get('weekly')
  async getWeeklyActivity(
    @CurrentUser() user: any,
    @Query('timezone') timezone?: string,
  ) {
    return this.activityService.getWeeklyActivity(user.id, timezone || 'UTC');
  }

  @Get('consistency')
  async getConsistencyStats(
    @CurrentUser() user: any,
    @Query('timezone') timezone?: string,
  ) {
    return this.activityService.getConsistencyStats(user.id, timezone || 'UTC');
  }

  @Get('history')
  async getActivityHistory(
    @CurrentUser() user: any,
    @Query() query: ActivityHistoryQueryDto,
  ) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;

    return this.activityService.getActivityHistory(user.id, {
      ...query,
      page,
      limit,
    });
  }
}
