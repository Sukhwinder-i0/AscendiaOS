import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai.interface';
import { ExtractedHierarchy, ExtractedHierarchySchema } from '@ascendiaos/shared';
import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL');
    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      ...(baseURL ? { baseURL } : {}),
    });
  }

  async analyzeSyllabusText(extractedText: string): Promise<ExtractedHierarchy> {
    const systemPrompt = `
You are an expert curriculum and syllabus extraction engine.
Analyze the provided syllabus text and return a JSON object strictly matching this JSON schema:

{
  "documentType": "FULL_EXAM_SYLLABUS" | "SUBJECT_SYLLABUS" | "CHAPTER_OR_TOPIC_DOCUMENT" | "UNKNOWN",
  "confidence": number between 0.0 and 1.0,
  "title": "Main title of the exam/syllabus document",
  "examName": "Optional name of the exam e.g. GATE / UGC / UPSC 2027",
  "subjects": [
    {
      "name": "Subject Name",
      "code": "Optional Subject Code",
      "description": "Optional description",
      "chapters": [
        {
          "name": "Chapter Name",
          "topics": [
            {
              "name": "Topic Name",
              "subtopics": [
                { "name": "Subtopic Name" }
              ]
            }
          ]
        }
      ]
    }
  ],
  "warnings": ["Array of warning strings if hierarchy is ambiguous or text is incomplete"],
  "sourceReferences": [
    { "pageNumber": 1, "snippet": "Text snippet" }
  ]
}

CRITICAL PARSING & EXTRACTION RULES:
1. COMPLETE SYLLABUS COVERAGE: Extract ALL subjects, sections, chapters, and topics present in the document from start to end. Do NOT skip, summarize, or stop early.
2. COMMA AND SEMICOLON TOPIC SPLITTING: Syllabi list topics in prose separated by commas (','), semicolons (';'), colons (':'), or bullet points. You MUST split these items into separate individual objects in the "topics" array. For example, if a section contains "Bayes Theorem, random variables, mean, median, mode and standard deviation", create separate topics: "Bayes Theorem", "Random Variables", "Mean", "Median", "Mode", "Standard Deviation".
3. HIERARCHY STRUCTURE:
   - Identify main subjects or discipline areas (e.g., "Probability & Statistics", "Linear Algebra", "Calculus & Optimization", "Machine Learning", "Programming & Data Structures", "Database Management").
   - Group topics logically into appropriate Subject and Chapter nodes using "Section 1: ...", "Unit I: ...", or "Module 1: ...".
4. CLEAN TERMINOLOGY: Preserve original academic terminology, but capitalize topic names neatly. Strip leading connectors like "and" or "or".
5. DOCUMENT TYPE CLASSIFICATION:
   - FULL_EXAM_SYLLABUS: Multiple distinct subjects/disciplines.
   - SUBJECT_SYLLABUS: Single subject with chapters/topics.
   - CHAPTER_OR_TOPIC_DOCUMENT: Single chapter/module topic list.
   - UNKNOWN: Non-syllabus document.
6. Return ONLY valid JSON adhering strictly to the schema.
`;

    try {
      // Use configured model; default to openai/gpt-oss-120b (65k max completion tokens on Groq)
      const model = this.configService.get<string>('OPENAI_MODEL') || 'openai/gpt-oss-120b';

      // Set max_tokens close to the model limit to avoid early truncation on large syllabi.
      // qwen/qwen3.8-27b cap is 16384; openai/gpt-oss-* cap is 65536.
      const maxTokens = model.includes('qwen') ? 16000 : 32000;

      this.logger.log(`Using model: ${model}, max_tokens: ${maxTokens}`);

      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Syllabus Content:\n\n${extractedText.slice(0, 80000)}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: maxTokens,
      });

      const choice = response.choices[0];
      const finishReason = choice?.finish_reason;

      // Warn if the model stopped due to length — JSON will be incomplete
      if (finishReason === 'length') {
        this.logger.warn(`Model stopped due to token limit (finish_reason=length). JSON may be truncated. Consider a model with higher max_completion_tokens.`);
      }

      this.logger.log(`finish_reason: ${finishReason}, usage: ${JSON.stringify(response.usage)}`);

      const content = choice?.message?.content || '{}';
      const parsedJson = JSON.parse(content);
      
      const validated = ExtractedHierarchySchema.parse(parsedJson);
      return validated;
    } catch (err: any) {
      this.logger.error('Failed to parse syllabus with OpenAI', err);
      throw new InternalServerErrorException(`AI Analysis failed: ${err.message || 'Malformed AI response'}`);
    }
  }
}
