import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { AIModule } from '../ai/ai.module';
import { DocumentParserService } from '../document-parser/document-parser.service';
import { SyllabusImportService } from './syllabus-import.service';
import { SyllabusImportController } from './syllabus-import.controller';

@Module({
  imports: [DatabaseModule, StorageModule, AIModule],
  providers: [DocumentParserService, SyllabusImportService],
  controllers: [SyllabusImportController],
  exports: [SyllabusImportService],
})
export class SyllabusImportModule {}
