import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from './storage.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (err) {
      this.logger.error('Failed to create uploads directory', err);
    }
  }

  async upload(fileBuffer: Buffer, filename: string, _mimeType: string): Promise<{ storageKey: string }> {
    await this.ensureUploadDir();
    const ext = path.extname(filename) || '.pdf';
    const storageKey = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, storageKey);

    await fs.writeFile(filePath, fileBuffer);
    this.logger.log(`Uploaded file to local storage: ${storageKey}`);
    return { storageKey };
  }

  async get(storageKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, storageKey);
    return fs.readFile(filePath);
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getPresignedUploadUrl(filename: string, _mimeType: string): Promise<{ uploadUrl: string; storageKey: string }> {
    const ext = path.extname(filename) || '';
    const storageKey = `${uuidv4()}${ext}`;
    return {
      uploadUrl: `/api/resources/upload`,
      storageKey,
    };
  }

  async getSignedDownloadUrl(storageKey: string): Promise<string> {
    return `/api/resources/file/${storageKey}`;
  }
}
