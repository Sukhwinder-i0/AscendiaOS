import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage.interface';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET') || 'studyos-storage';
    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3_REGION') || 'us-east-1',
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY') || '',
      },
      forcePathStyle: true,
    });
  }

  async upload(fileBuffer: Buffer, filename: string, mimeType: string): Promise<{ storageKey: string }> {
    const ext = path.extname(filename) || '.pdf';
    const storageKey = `syllabi/${uuidv4()}${ext}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        Body: fileBuffer,
        ContentType: mimeType,
      }),
    );

    this.logger.log(`Uploaded file to S3: ${storageKey}`);
    return { storageKey };
  }

  async get(storageKey: string): Promise<Buffer> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      }),
    );

    const byteArray = await response.Body?.transformToByteArray();
    if (!byteArray) {
      throw new Error(`Failed to retrieve file from S3: ${storageKey}`);
    }
    return Buffer.from(byteArray);
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: storageKey,
        }),
      );
      return true;
    } catch (err) {
      this.logger.error(`Failed to delete S3 file: ${storageKey}`, err);
      return false;
    }
  }
}
