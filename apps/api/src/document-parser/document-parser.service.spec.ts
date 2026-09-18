import { DocumentParserService } from './document-parser.service';
import { BadRequestException } from '@nestjs/common';

describe('DocumentParserService', () => {
  let service: DocumentParserService;

  beforeEach(() => {
    service = new DocumentParserService();
  });

  it('should throw BadRequestException if empty buffer provided', async () => {
    await expect(service.parsePdf(Buffer.from(''))).rejects.toThrow(BadRequestException);
  });

  it('should normalize extracted text trimming whitespace and joining lines', () => {
    const raw = '  Header 1 \n\n\n  1.1 Topic  \n   Some text   with   spaces  ';
    const normalized = service.normalizeText(raw);
    expect(normalized).toBe('Header 1\n1.1 Topic\nSome text with spaces');
  });
});
