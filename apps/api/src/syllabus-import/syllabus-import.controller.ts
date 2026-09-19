import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserPayload, ApproveSyllabusImportSchema, DocumentResponse } from '@studyos/shared';
import { SyllabusImportService } from './syllabus-import.service';
import { z } from 'zod';

@Controller('syllabus-import')
@UseGuards(JwtAuthGuard)
export class SyllabusImportController {
  constructor(private readonly importService: SyllabusImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSyllabus(
    @CurrentUser() user: UserPayload,
    @UploadedFile() file: Express.Multer.File,
    @Query('examId') examId?: string,
  ): Promise<DocumentResponse> {
    return this.importService.uploadAndProcess(user.id, file, examId);
  }

  @Get('documents/:id')
  async getDocument(
    @CurrentUser() user: UserPayload,
    @Param('id') documentId: string,
  ): Promise<DocumentResponse> {
    return this.importService.getDocument(user.id, documentId);
  }

  @Post('documents/:id/approve')
  async approveImport(
    @CurrentUser() user: UserPayload,
    @Param('id') documentId: string,
    @Body() body: unknown,
  ): Promise<{ success: boolean; examId: string }> {
    try {
      const dto = ApproveSyllabusImportSchema.parse(body);
      return await this.importService.approveImport(user.id, documentId, dto);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Invalid syllabus approval payload',
          errors: err.errors,
        });
      }
      throw err;
    }
  }
}
