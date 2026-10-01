import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from './ai.interface';
import { ExtractedHierarchy, SyllabusDocumentType } from '@ascendiaos/shared';

@Injectable()
export class MockAIProvider implements AIProvider {
  private readonly logger = new Logger(MockAIProvider.name);

  async analyzeSyllabusText(extractedText: string): Promise<ExtractedHierarchy> {
    this.logger.log(`[HeuristicParser] Parsing ${extractedText.length} chars of syllabus text`);

    const parsed = this.parseHeuristicSyllabus(extractedText);
    if (parsed && parsed.subjects.length > 0) {
      this.logger.log(`[HeuristicParser] Extracted ${parsed.subjects.length} subjects`);
      return parsed;
    }

    // Generic fallback
    return {
      documentType: SyllabusDocumentType.UNKNOWN,
      confidence: 0.3,
      title: 'Extracted Syllabus Document',
      examName: undefined,
      subjects: [
        {
          name: 'General Topics',
          chapters: [{ name: 'Module 1', topics: [{ name: 'Introduction and Core Concepts' }] }],
        },
      ],
      warnings: ['Could not detect structured sections. Please review and edit the tree manually.'],
      sourceReferences: [{ pageNumber: 1, snippet: extractedText.slice(0, 120) }],
    };
  }

  private parseHeuristicSyllabus(rawText: string): ExtractedHierarchy | null {
    if (!rawText || rawText.trim().length < 20) return null;

    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // -----------------------------------------------------------------------
    // 1. Detect document title and exam name from first ~10 lines
    // -----------------------------------------------------------------------
    let docTitle = 'Extracted Syllabus';
    let examName: string | undefined;
    for (const line of lines.slice(0, 10)) {
      if (line.length < 120 && /[A-Z]/.test(line)) {
        docTitle = line;
        if (/gate|ugc|upsc|jee|neet|cat|gmat|gre|ielts|civil/i.test(line)) {
          examName = line;
        }
        break;
      }
    }

    // -----------------------------------------------------------------------
    // 2. Section/Subject header patterns (ordered by specificity)
    //    Matches:
    //      "Section 7: Compiler Design"   "Unit I: Mathematics"
    //      "3. Operating Systems"         "COMPILER DESIGN" (all-caps)
    //      "## Compiler Design"
    // -----------------------------------------------------------------------
    const SECTION_PATTERNS: RegExp[] = [
      /^(?:section|unit|module|chapter|part)\s*(\d+|[IVXLCDM]+)\s*[:\-\u2013]\s*(.+)$/i,
      /^(\d{1,2})[.)]\s+([A-Z][A-Za-z0-9\s&/()\-]{3,60})$/,
      /^([A-Z][A-Z\s&/()\-]{4,50})$/,
      /^#{1,3}\s+(.+)$/,
    ];

    type SubjectNode = {
      name: string;
      chapters: Array<{ name: string; topics: Array<{ name: string }> }>;
    };

    const subjects: SubjectNode[] = [];
    let currentSubject: SubjectNode | null = null;
    let currentTextBuf = '';

    const flushBuffer = () => {
      if (!currentSubject || !currentTextBuf.trim()) return;
      currentSubject.chapters.push(...this.extractChapters(currentSubject.name, currentTextBuf));
      currentTextBuf = '';
    };

    for (const line of lines) {
      let matched = false;

      for (const pattern of SECTION_PATTERNS) {
        const m = line.match(pattern);
        if (!m) continue;

        const candidateName = (m[2] || m[1] || '').trim();
        if (candidateName.length < 3) continue;
        if (/^\d{1,4}$/.test(candidateName)) continue;
        if (this.isNoiseLine(candidateName)) continue;

        flushBuffer();
        currentSubject = { name: this.toTitleCase(candidateName), chapters: [] };
        subjects.push(currentSubject);
        matched = true;
        break;
      }

      if (!matched) {
        if (currentSubject) {
          currentTextBuf += ' ' + line;
        } else if (/gate|ugc|upsc|jee|neet/i.test(line) && !examName) {
          examName = line.length < 100 ? line : undefined;
        }
      }
    }
    flushBuffer();

    if (subjects.length === 0) return null;

    const validSubjects = subjects.filter(
      (s) => s.chapters.length > 0 && s.chapters.some((c) => c.topics.length > 0),
    );

    if (validSubjects.length === 0) return null;

    return {
      documentType:
        validSubjects.length > 1
          ? SyllabusDocumentType.FULL_EXAM_SYLLABUS
          : SyllabusDocumentType.SUBJECT_SYLLABUS,
      confidence: validSubjects.length > 3 ? 0.92 : 0.75,
      title: docTitle,
      examName,
      subjects: validSubjects,
      warnings: [],
      sourceReferences: [{ pageNumber: 1, snippet: rawText.slice(0, 150) }],
    };
  }

  /**
   * Given text for one subject section, extract chapters using inline
   * colon-headers like "Lexical analysis: tokens, patterns, ..."
   */
  private extractChapters(
    subjectName: string,
    textBlock: string,
  ): Array<{ name: string; topics: Array<{ name: string }> }> {
    const chapters: Array<{ name: string; topics: Array<{ name: string }> }> = [];

    // Inline chapter header: "Word(s): content"
    const CHAPTER_HEADER_RE = /([A-Z][A-Za-z0-9\s&/()\-]{2,40}):\s*/g;
    const segs: Array<{ chapterName: string; start: number; end: number }> = [];
    let m: RegExpExecArray | null;

    while ((m = CHAPTER_HEADER_RE.exec(textBlock)) !== null) {
      const candidateName = m[1].trim();
      if (this.isNoiseLine(candidateName) || candidateName.split(' ').length > 6) continue;
      segs.push({ chapterName: candidateName, start: m.index, end: CHAPTER_HEADER_RE.lastIndex });
    }

    if (segs.length > 0) {
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        const nextStart = i + 1 < segs.length ? segs[i + 1].start : textBlock.length;
        const chunk = textBlock.slice(seg.end, nextStart);
        const topics = this.extractTopics(chunk);
        if (topics.length > 0) {
          chapters.push({ name: this.toTitleCase(seg.chapterName), topics });
        }
      }
    } else {
      const topics = this.extractTopics(textBlock);
      if (topics.length > 0) {
        chapters.push({ name: subjectName, topics });
      }
    }

    return chapters;
  }

  /**
   * Splits a raw text chunk into individual topic names.
   * Splits on commas, semicolons, bullet chars, newlines, and non-decimal periods.
   */
  private extractTopics(text: string): Array<{ name: string }> {
    const raw = text.split(/(?<!\d)\.(?!\d)|[,;\n\u2022\u00b7\u2013]/);
    const topics: Array<{ name: string }> = [];

    for (let item of raw) {
      item = item
        .trim()
        .replace(/^[-\u2022*\u00b7\d]+[.)]\s*/, '')
        .replace(/^(and|or|also|including|such as|e\.g\.|i\.e\.)\s+/i, '')
        .replace(/\.$/, '')
        .trim();

      if (
        item.length > 2 &&
        item.length < 120 &&
        !this.isNoiseLine(item) &&
        !/^[IVXLCDM]+$/.test(item) &&
        !/^\d+$/.test(item)
      ) {
        topics.push({ name: this.toTitleCase(item) });
      }
    }

    const seen = new Set<string>();
    return topics.filter((t) => {
      const key = t.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private isNoiseLine(text: string): boolean {
    return /^(note|references?|bibliography|page|figure|table|appendix|copyright|all rights|iit|organiz|institute|date|year|semester|credit|marks|duration|time|total|max|min|pass|fail|grade|exam name|course code|prepared by|approved by|version)\b/i.test(
      text,
    );
  }

  private toTitleCase(str: string): string {
    if (str === str.toUpperCase() && str.length > 4) {
      return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
