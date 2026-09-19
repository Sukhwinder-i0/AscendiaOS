import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import { ResourceType } from '@studyos/shared';

export interface ValidatedFileInfo {
  sanitizedFilename: string;
  mimeType: string;
  sizeBytes: number;
  type: ResourceType;
  extension: string;
}

@Injectable()
export class FileValidatorService {
  private readonly maxSizeBytes = 50 * 1024 * 1024; // 50MB limit

  validateFile(filename: string, mimeType: string, sizeBytes: number): ValidatedFileInfo {
    if (!filename || filename.trim().length === 0) {
      throw new BadRequestException('Filename cannot be empty');
    }

    // Path traversal check & sanitation
    const sanitizedFilename = path.basename(filename.trim());
    if (sanitizedFilename.includes('..') || sanitizedFilename.includes('/') || sanitizedFilename.includes('\\')) {
      throw new BadRequestException('Invalid filename provided');
    }

    if (sizeBytes <= 0) {
      throw new BadRequestException('File size must be greater than 0 bytes');
    }

    if (sizeBytes > this.maxSizeBytes) {
      throw new BadRequestException(
        `File size exceeds maximum allowed limit of ${Math.round(this.maxSizeBytes / (1024 * 1024))}MB`,
      );
    }

    const ext = path.extname(sanitizedFilename).toLowerCase();
    const type = this.detectResourceType(ext, mimeType);

    return {
      sanitizedFilename,
      mimeType: mimeType || 'application/octet-stream',
      sizeBytes,
      type,
      extension: ext,
    };
  }

  detectResourceType(ext: string, mimeType: string): ResourceType {
    const cleanMime = (mimeType || '').toLowerCase();

    // PDF
    if (ext === '.pdf' || cleanMime === 'application/pdf') {
      return ResourceType.PDF;
    }

    // Markdown
    if (ext === '.md' || ext === '.markdown' || cleanMime === 'text/markdown' || cleanMime === 'text/x-markdown') {
      return ResourceType.MARKDOWN;
    }

    // TXT
    if (ext === '.txt' || (cleanMime === 'text/plain' && ext !== '.md')) {
      return ResourceType.TXT;
    }

    // Image
    if (
      ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.ico'].includes(ext) ||
      cleanMime.startsWith('image/')
    ) {
      return ResourceType.IMAGE;
    }

    // Code
    const codeExtensions = [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.py',
      '.java',
      '.c',
      '.cpp',
      '.h',
      '.hpp',
      '.cs',
      '.go',
      '.rs',
      '.html',
      '.css',
      '.json',
      '.sql',
      '.sh',
      '.yml',
      '.yaml',
      '.xml',
      '.kt',
      '.rb',
      '.php',
    ];
    if (codeExtensions.includes(ext) || cleanMime.includes('javascript') || cleanMime.includes('json')) {
      return ResourceType.CODE;
    }

    return ResourceType.GENERIC_FILE;
  }
}
