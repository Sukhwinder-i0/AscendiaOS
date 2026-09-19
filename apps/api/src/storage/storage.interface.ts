export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface StorageProvider {
  upload(fileBuffer: Buffer, filename: string, mimeType: string): Promise<{ storageKey: string }>;
  get(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<boolean>;
  getPresignedUploadUrl?(filename: string, mimeType: string): Promise<{ uploadUrl: string; storageKey: string }>;
  getSignedDownloadUrl?(storageKey: string): Promise<string>;
}
