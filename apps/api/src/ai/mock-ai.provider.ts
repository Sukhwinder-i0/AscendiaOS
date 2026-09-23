import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from './ai.interface';
import { ExtractedHierarchy, SyllabusDocumentType } from '@ascendiaos/shared';

@Injectable()
export class MockAIProvider implements AIProvider {
  private readonly logger = new Logger(MockAIProvider.name);

  async analyzeSyllabusText(extractedText: string): Promise<ExtractedHierarchy> {
    this.logger.log('MockAIProvider analyzing syllabus text...');

    const parsedHierarchy = this.parseHeuristicSyllabus(extractedText);
    if (parsedHierarchy && parsedHierarchy.subjects.length > 0) {
      return parsedHierarchy;
    }

    // Static fallback if text contains negligible section structure
    return {
      documentType: SyllabusDocumentType.FULL_EXAM_SYLLABUS,
      confidence: 0.85,
      title: 'Extracted Syllabus Document',
      examName: 'General Syllabus Overview',
      subjects: [
        {
          name: 'General Subject',
          code: 'GEN',
          description: 'Core concepts extracted from syllabus',
          chapters: [
            {
              name: 'Module 1: Foundations',
              topics: [
                { name: 'Introduction and Basic Definitions' },
                { name: 'Core Principles & Key Concepts' },
              ],
            },
            {
              name: 'Module 2: Core Topics',
              topics: [
                { name: 'System Architecture & Design' },
                { name: 'Optimization & Performance' },
              ],
            },
          ],
        },
      ],
      warnings: ['Extracted with standard fallback heuristics'],
      sourceReferences: [{ pageNumber: 1, snippet: extractedText.slice(0, 100) }],
    };
  }

  private parseHeuristicSyllabus(rawText: string): ExtractedHierarchy | null {
    if (!rawText || rawText.trim().length < 20) return null;

    const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const subjects: Array<{
      name: string;
      code?: string;
      chapters: Array<{ name: string; topics: Array<{ name: string }> }>;
    }> = [];

    let currentSubject: {
      name: string;
      code?: string;
      chapters: Array<{ name: string; topics: Array<{ name: string }> }>;
    } | null = null;
    let currentTextBuf = '';

    const flushBuffer = () => {
      if (!currentSubject || !currentTextBuf.trim()) return;

      const rawItems = currentTextBuf.split(/[,;\n]/);
      const topics: Array<{ name: string }> = [];

      for (let item of rawItems) {
        item = item
          .trim()
          .replace(/^[-•*]\s*/, '')
          .replace(/^and\s+/i, '')
          .replace(/^or\s+/i, '')
          .replace(/\.$/, '');

        if (
          item.length > 2 &&
          !/^(section|unit|module|chapter|part)\s*\d*/i.test(item) &&
          !/^\d+\s*of\s*\d+$/i.test(item)
        ) {
          // Capitalize first letter neatly
          const cleanName = item.charAt(0).toUpperCase() + item.slice(1);
          topics.push({ name: cleanName });
        }
      }

      if (topics.length > 0) {
        currentSubject.chapters.push({
          name: `${currentSubject.name} Topics`,
          topics,
        });
      }
      currentTextBuf = '';
    };

    // Header regexes matching Section 1:, Unit I:, Chapter 1:, Module 1:, Subject: etc.
    const sectionHeaderRegex = /^(?:Section|Unit|Module|Chapter|Part|Subject)\s*(\d+|[IVXLCDM]+)?\s*[:\-]?\s*(.+)$/i;

    for (const line of lines) {
      const secMatch = line.match(sectionHeaderRegex);
      if (secMatch) {
        flushBuffer();
        const secNum = secMatch[1] ? `Section ${secMatch[1]}: ` : '';
        const secName = secMatch[2].trim();
        currentSubject = {
          name: secNum + secName,
          chapters: [],
        };
        subjects.push(currentSubject);
      } else if (currentSubject) {
        currentTextBuf += ' ' + line;
      } else {
        const upperLine = line.toUpperCase();
        if (
          upperLine.includes('SYLLABUS') ||
          upperLine.includes('GATE') ||
          upperLine.includes('UGC') ||
          upperLine.includes('UPSC') ||
          upperLine.includes('JEE') ||
          upperLine.includes('EXAM')
        ) {
          // Keep title context
        }
      }
    }
    flushBuffer();

    if (subjects.length === 0) {
      return null;
    }

    // Try extracting document title from first line
    const firstLine = lines[0] || 'Extracted Syllabus';
    const docTitle = firstLine.length < 80 ? firstLine : 'Extracted Syllabus';

    return {
      documentType:
        subjects.length > 1 ? SyllabusDocumentType.FULL_EXAM_SYLLABUS : SyllabusDocumentType.SUBJECT_SYLLABUS,
      confidence: 0.9,
      title: docTitle,
      examName: docTitle,
      subjects,
      warnings: [],
      sourceReferences: [{ pageNumber: 1, snippet: rawText.slice(0, 150) }],
    };
  }
}

