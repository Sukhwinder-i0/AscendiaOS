import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParseModule = require('pdf-parse');

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
}

export interface DocumentParseResult {
  text: string;
  numPages: number;
  pages: ExtractedPageText[];
  isScannedOrEmpty: boolean;
}

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);

  async parsePdf(fileBuffer: Buffer): Promise<DocumentParseResult> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('Empty file buffer provided');
    }

    try {
      let rawText = '';
      let numPages = 0;
      const pages: ExtractedPageText[] = [];

      const PDFParseClass =
        pdfParseModule?.PDFParse ||
        pdfParseModule?.default?.PDFParse ||
        (typeof pdfParseModule === 'function' ? null : null);

      if (PDFParseClass) {
        const parser = new PDFParseClass({ data: fileBuffer });
        const parsedData = await parser.getText();
        rawText = parsedData.text || '';
        numPages = parsedData.total || (parsedData.pages ? parsedData.pages.length : 1);
        if (parsedData.pages && Array.isArray(parsedData.pages)) {
          parsedData.pages.forEach((p: any, idx: number) => {
            pages.push({
              pageNumber: p.num || idx + 1,
              text: p.text || '',
            });
          });
        }
      } else if (typeof pdfParseModule === 'function') {
        const options: any = {
          pagerender: (pageData: any) => {
            return pageData.getTextContent().then((textContent: any) => {
              let lastY: number | null = null;
              let text = '';
              for (const item of textContent.items) {
                if (lastY === null || Math.abs(lastY - item.transform[5]) > 5) {
                  text += '\n' + item.str;
                } else {
                  text += ' ' + item.str;
                }
                lastY = item.transform[5];
              }
              pages.push({
                pageNumber: pageData.pageIndex + 1,
                text: text.trim(),
              });
              return text;
            });
          },
        };

        const data = await pdfParseModule(fileBuffer, options);
        rawText = data.text || '';
        numPages = data.numpages || pages.length || 1;
      } else {
        throw new Error('pdf-parse module is neither a function nor contains PDFParse class');
      }

      const normalizedText = this.normalizeText(rawText);
      const isScannedOrEmpty = normalizedText.length < 50;

      if (isScannedOrEmpty) {
        this.logger.warn('Extracted text contains fewer than 50 characters. Likely a scanned/image PDF.');
      }

      return {
        text: normalizedText,
        numPages: numPages || 1,
        pages,
        isScannedOrEmpty,
      };
    } catch (err: any) {
      this.logger.error('Failed to extract text from PDF', err);
      throw new BadRequestException(`PDF parsing failed: ${err.message || 'Corrupted or unreadable PDF'}`);
    }
  }

  normalizeText(text: string): string {
    return text
      // Replace multiple blank lines with double line breaks to preserve paragraphs/headers
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      // Normalize multiple spaces into single space on the same line
      .replace(/[ \t]+/g, ' ')
      // Trim lines
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }
}
