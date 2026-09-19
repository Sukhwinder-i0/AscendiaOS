import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { UrlDetectorService } from './url-detector.service';
import { UrlMetadataScraperService } from './url-metadata-scraper.service';
import { FileValidatorService } from './file-validator.service';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [ResourcesController],
  providers: [
    ResourcesService,
    UrlDetectorService,
    UrlMetadataScraperService,
    FileValidatorService,
  ],
  exports: [ResourcesService],
})
export class ResourcesModule {}
