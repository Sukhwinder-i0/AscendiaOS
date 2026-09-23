import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Root & System Metadata' })
  getSystemInfo() {
    return {
      name: 'AscendiaOS Monorepo API',
      status: 'online',
      version: '1.0.0',
      author: 'sukhwinder-i0',
      github: 'https://github.com/sukhwinder-i0',
      documentation: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check Endpoint' })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
