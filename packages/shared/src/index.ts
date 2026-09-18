import { z } from 'zod';

// ==========================================
// ENUMS
// ==========================================

export const ProgressStatus = {
  NOT_STARTED: 'NOT_STARTED',
  LEARNING: 'LEARNING',
  COMPLETED: 'COMPLETED',
  NEEDS_REVISION: 'NEEDS_REVISION',
  MASTERED: 'MASTERED',
} as const;
export type ProgressStatus = (typeof ProgressStatus)[keyof typeof ProgressStatus];

export const ResourceType = {
  YOUTUBE_VIDEO: 'YOUTUBE_VIDEO',
  YOUTUBE_PLAYLIST: 'YOUTUBE_PLAYLIST',
  WEBSITE: 'WEBSITE',
  PDF: 'PDF',
  MARKDOWN: 'MARKDOWN',
  TXT: 'TXT',
  IMAGE: 'IMAGE',
  GENERIC_FILE: 'GENERIC_FILE',
  CODE: 'CODE',
  BOOKMARK: 'BOOKMARK',
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const ResourceLocationType = {
  INBOX: 'INBOX',
  EXAM: 'EXAM',
  SUBJECT: 'SUBJECT',
  CHAPTER: 'CHAPTER',
  TOPIC: 'TOPIC',
} as const;
export type ResourceLocationType = (typeof ResourceLocationType)[keyof typeof ResourceLocationType];

export const DocumentProcessingStatus = {
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  EXTRACTED: 'EXTRACTED',
  ANALYZED: 'ANALYZED',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  APPROVED: 'APPROVED',
  FAILED: 'FAILED',
} as const;
export type DocumentProcessingStatus = (typeof DocumentProcessingStatus)[keyof typeof DocumentProcessingStatus];

export const SyllabusDocumentType = {
  FULL_EXAM_SYLLABUS: 'FULL_EXAM_SYLLABUS',
  SUBJECT_SYLLABUS: 'SUBJECT_SYLLABUS',
  CHAPTER_OR_TOPIC_DOCUMENT: 'CHAPTER_OR_TOPIC_DOCUMENT',
  UNKNOWN: 'UNKNOWN',
} as const;
export type SyllabusDocumentType = (typeof SyllabusDocumentType)[keyof typeof SyllabusDocumentType];

// ==========================================
// SYLLABUS AI IMPORT SCHEMAS & TYPES
// ==========================================

export const ExtractedTopicSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string().min(1, 'Topic name is required'),
    subtopics: z.array(ExtractedTopicSchema).optional().default([]),
  })
);

export const ExtractedChapterSchema = z.object({
  name: z.string().min(1, 'Chapter name is required'),
  topics: z.array(ExtractedTopicSchema).default([]),
});

export const ExtractedSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  chapters: z.array(ExtractedChapterSchema).default([]),
});
export type ExtractedSubject = z.infer<typeof ExtractedSubjectSchema>;
export type ExtractedChapter = z.infer<typeof ExtractedChapterSchema>;
export type ExtractedTopic = z.infer<typeof ExtractedTopicSchema>;

export const ExtractedHierarchySchema = z.object({
  documentType: z.enum([
    'FULL_EXAM_SYLLABUS',
    'SUBJECT_SYLLABUS',
    'CHAPTER_OR_TOPIC_DOCUMENT',
    'UNKNOWN',
  ]),
  confidence: z.number().min(0).max(1),
  title: z.string().min(1, 'Title is required'),
  examName: z.string().optional(),
  subjects: z.array(ExtractedSubjectSchema).default([]),
  warnings: z.array(z.string()).default([]),
  sourceReferences: z
    .array(
      z.object({
        pageNumber: z.number().optional(),
        snippet: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});
export type ExtractedHierarchy = z.infer<typeof ExtractedHierarchySchema>;

export const ApproveSyllabusImportSchema = z.object({
  targetExamId: z.string().optional(),
  examTitle: z.string().optional(),
  subjects: z.array(ExtractedSubjectSchema),
});
export type ApproveSyllabusImportDto = z.infer<typeof ApproveSyllabusImportSchema>;

export interface DocumentResponse {
  id: string;
  userId: string;
  examId?: string | null;
  filename: string;
  mimeType: string;
  storageKey: string;
  sizeBytes: number;
  status: DocumentProcessingStatus;
  documentType?: SyllabusDocumentType | null;
  aiConfidence?: number | null;
  extractedHierarchy?: ExtractedHierarchy | null;
  warnings?: string[] | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// AUTH SCHEMAS & TYPES
// ==========================================

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export interface UserPayload {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  user: UserPayload;
  accessToken: string;
}

// ==========================================
// EXAM SCHEMAS & TYPES
// ==========================================

export const CreateExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  code: z.string().optional(),
  targetDate: z.string().optional(), // ISO String
  targetScore: z.number().optional(),
  targetRank: z.number().optional(),
  dailyGoalHours: z.number().min(0.5).max(24).default(4.0),
});
export type CreateExamDto = z.input<typeof CreateExamSchema>;

export const UpdateExamSchema = CreateExamSchema.partial();
export type UpdateExamDto = z.input<typeof UpdateExamSchema>;

export interface ExamResponse {
  id: string;
  userId: string;
  title: string;
  code?: string | null;
  targetDate?: string | null;
  targetScore?: number | null;
  targetRank?: number | null;
  dailyGoalHours: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  overallProgressPercentage?: number;
  daysRemaining?: number | null;
}

// ==========================================
// SYLLABUS HIERARCHY SCHEMAS & TYPES
// ==========================================

export const CreateSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().optional(),
  colorHex: z.string().optional().default('#3B82F6'),
});
export type CreateSubjectDto = z.input<typeof CreateSubjectSchema>;

export const CreateChapterSchema = z.object({
  name: z.string().min(1, 'Chapter name is required'),
});
export type CreateChapterDto = z.infer<typeof CreateChapterSchema>;

export const CreateTopicSchema = z.object({
  name: z.string().min(1, 'Topic name is required'),
  parentId: z.string().optional(),
});
export type CreateTopicDto = z.infer<typeof CreateTopicSchema>;

export const UpdateNodeSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  code: z.string().optional(),
  colorHex: z.string().optional(),
});
export type UpdateNodeDto = z.infer<typeof UpdateNodeSchema>;

export const MoveTopicSchema = z.object({
  targetChapterId: z.string().optional(),
  targetParentId: z.string().optional().nullable(),
});
export type MoveTopicDto = z.infer<typeof MoveTopicSchema>;

export const ReorderSchema = z.object({
  nodeType: z.enum(['SUBJECT', 'CHAPTER', 'TOPIC']),
  nodeIdsInOrder: z.array(z.string()),
});
export type ReorderSyllabusDto = z.infer<typeof ReorderSchema>;

// Progress calculation status update
export const UpdateTopicProgressSchema = z.object({
  status: z.nativeEnum(ProgressStatus),
  confidenceScore: z.number().min(1).max(5).optional(),
});
export type UpdateTopicProgressDto = z.infer<typeof UpdateTopicProgressSchema>;

// Hierarchy tree response interfaces
export interface TopicProgressResponse {
  id: string;
  topicId: string;
  status: ProgressStatus;
  confidenceScore: number;
  masteryScore: number;
  totalStudyTimeSec: number;
  lastStudiedAt?: string | null;
}

export interface TopicNode {
  id: string;
  chapterId: string;
  parentId?: string | null;
  name: string;
  orderIndex: number;
  path: string;
  progress: TopicProgressResponse;
  subtopics: TopicNode[];
  createdAt: string;
  updatedAt: string;
}

export interface ChapterNode {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number;
  topics: TopicNode[];
  progressPercentage: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectNode {
  id: string;
  examId: string;
  name: string;
  code?: string | null;
  colorHex?: string | null;
  orderIndex: number;
  chapters: ChapterNode[];
  progressPercentage: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyllabusTreeResponse {
  examId: string;
  subjects: SubjectNode[];
  overallProgressPercentage: number;
  totalSubjects: number;
  totalChapters: number;
  totalTopics: number;
  completedTopics: number;
}
