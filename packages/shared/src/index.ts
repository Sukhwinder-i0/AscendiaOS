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

export const SessionType = {
  LEARNING: 'LEARNING',
  REVISION: 'REVISION',
  PRACTICE: 'PRACTICE',
  READING: 'READING',
  NOTES: 'NOTES',
  QUIZ: 'QUIZ',
} as const;
export type SessionType = (typeof SessionType)[keyof typeof SessionType];

export const SessionStatus = {
  CREATED: 'CREATED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  DISCARDED: 'DISCARDED',
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

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

export const ResourceProcessingStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;
export type ResourceProcessingStatus = (typeof ResourceProcessingStatus)[keyof typeof ResourceProcessingStatus];

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
  sessionCount?: number;
  lastStudiedAt?: string | null;
  completedAt?: string | null;
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

// ==========================================
// RESOURCE SCHEMAS & TYPES
// ==========================================

export const CreateUrlResourceSchema = z.object({
  url: z.string().url('Invalid URL format'),
  title: z.string().optional(),
  description: z.string().optional(),
  locationType: z.enum(['INBOX', 'EXAM', 'SUBJECT', 'CHAPTER', 'TOPIC']).optional().default('INBOX'),
  examId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
});
export type CreateUrlResourceDto = z.input<typeof CreateUrlResourceSchema>;

export const CreateFileResourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  locationType: z.enum(['INBOX', 'EXAM', 'SUBJECT', 'CHAPTER', 'TOPIC']).optional().default('INBOX'),
  examId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
});
export type CreateFileResourceDto = z.input<typeof CreateFileResourceSchema>;

export const PresignUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  sizeBytes: z.number().positive('File size must be positive'),
});
export type PresignUploadDto = z.infer<typeof PresignUploadSchema>;

export const CompletePresignedUploadSchema = z.object({
  storageKey: z.string().min(1, 'Storage key is required'),
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  sizeBytes: z.number().positive(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  locationType: z.enum(['INBOX', 'EXAM', 'SUBJECT', 'CHAPTER', 'TOPIC']).optional().default('INBOX'),
  examId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
});
export type CompletePresignedUploadDto = z.infer<typeof CompletePresignedUploadSchema>;

export const UpdateResourceSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional(),
});
export type UpdateResourceDto = z.infer<typeof UpdateResourceSchema>;

export const AssignResourceSchema = z.object({
  locationType: z.enum(['INBOX', 'EXAM', 'SUBJECT', 'CHAPTER', 'TOPIC']),
  examId: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
});
export type AssignResourceDto = z.infer<typeof AssignResourceSchema>;

export const MoveResourceSchema = AssignResourceSchema;
export type MoveResourceDto = z.infer<typeof MoveResourceSchema>;

export const ResourceQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum([
    'YOUTUBE_VIDEO',
    'YOUTUBE_PLAYLIST',
    'WEBSITE',
    'PDF',
    'MARKDOWN',
    'TXT',
    'IMAGE',
    'GENERIC_FILE',
    'CODE',
    'BOOKMARK',
  ]).optional(),
  locationType: z.enum(['INBOX', 'EXAM', 'SUBJECT', 'CHAPTER', 'TOPIC']).optional(),
  examId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  isCompleted: z.boolean().optional(),
  isAssigned: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});
export type ResourceQueryDto = z.input<typeof ResourceQuerySchema>;

export interface ResourceResponse {
  id: string;
  userId: string;
  locationType: ResourceLocationType;
  type: ResourceType;
  title: string;
  description?: string | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  storageKey?: string | null;
  thumbnailUrl?: string | null;
  status: ResourceProcessingStatus;
  provider?: string | null;
  externalId?: string | null;
  metadata?: Record<string, any> | null;
  isCompleted: boolean;
  completedAt?: string | null;
  examId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  exam?: { id: string; title: string } | null;
  subject?: { id: string; name: string } | null;
  chapter?: { id: string; name: string } | null;
  topic?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UrlMetadataResponse {
  url: string;
  type: ResourceType;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  provider?: string | null;
  externalId?: string | null;
  domain?: string | null;
  metadata?: Record<string, any>;
}

// ==========================================
// NOTE SCHEMAS & TYPES
// ==========================================

export const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional().default(''),
  contentFormat: z.enum(['MARKDOWN', 'RICH_TEXT']).optional().default('MARKDOWN'),
  examId: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  template: z
    .enum(['STANDARD', 'FORMULA_SHEET', 'CONCEPT_SUMMARY', 'MISTAKE_LOG', 'REVISION_NOTES'])
    .optional(),
});
export type CreateNoteDto = z.input<typeof CreateNoteSchema>;

export const UpdateNoteSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  content: z.string().optional(),
  contentFormat: z.enum(['MARKDOWN', 'RICH_TEXT']).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});
export type UpdateNoteDto = z.infer<typeof UpdateNoteSchema>;

export const MoveNoteSchema = z.object({
  examId: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
});
export type MoveNoteDto = z.infer<typeof MoveNoteSchema>;

export const NoteQuerySchema = z.object({
  search: z.string().optional(),
  examId: z.string().optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});
export type NoteQueryDto = z.input<typeof NoteQuerySchema>;

export const AttachResourceToNoteSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
});
export type AttachResourceToNoteDto = z.infer<typeof AttachResourceToNoteSchema>;

export interface NoteResponse {
  id: string;
  userId: string;
  title: string;
  content: string;
  contentFormat: string;
  isPinned: boolean;
  isArchived: boolean;
  examId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  exam?: { id: string; title: string } | null;
  subject?: { id: string; name: string } | null;
  chapter?: { id: string; name: string } | null;
  topic?: { id: string; name: string } | null;
  resources?: ResourceResponse[];
  snippet?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// STUDY SESSION SCHEMAS & TYPES
// ==========================================

export const CreateStudySessionSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  sessionType: z
    .enum(['LEARNING', 'REVISION', 'PRACTICE', 'READING', 'NOTES', 'QUIZ'])
    .optional()
    .default('LEARNING'),
  goal: z.string().optional(),
});
export type CreateStudySessionDto = z.input<typeof CreateStudySessionSchema>;

export const FinishStudySessionSchema = z.object({
  reflection: z.string().optional(),
  confidence: z.number().int().min(1).max(5).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  markTopicCompleted: z.boolean().optional(),
});
export type FinishStudySessionDto = z.input<typeof FinishStudySessionSchema>;

export const StudySessionQuerySchema = z.object({
  topicId: z.string().optional(),
  subjectId: z.string().optional(),
  examId: z.string().optional(),
  sessionType: z
    .enum(['LEARNING', 'REVISION', 'PRACTICE', 'READING', 'NOTES', 'QUIZ'])
    .optional(),
  status: z
    .enum(['CREATED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'DISCARDED'])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timezone: z.string().optional().default('UTC'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});
export type StudySessionQueryDto = z.input<typeof StudySessionQuerySchema>;

export interface StudySessionResponse {
  id: string;
  userId: string;
  examId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId: string;
  sessionType: SessionType;
  status: SessionStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  lastPausedAt?: string | null;
  totalPauseSeconds: number;
  durationSeconds: number;
  activeDurationSeconds?: number;
  goal?: string | null;
  reflection?: string | null;
  confidence?: number | null;
  difficulty?: string | null;
  exam?: { id: string; title: string } | null;
  subject?: { id: string; name: string } | null;
  chapter?: { id: string; name: string } | null;
  topic?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailySummaryResponse {
  date: string;
  timezone: string;
  totalStudySeconds: number;
  sessionCount: number;
  topicsStudiedCount: number;
  topicsCompletedCount: number;
  subjectsStudied: Array<{ id: string; name: string; colorHex?: string | null; durationSeconds: number }>;
}

export interface ProgressAggregateResponse {
  examId: string;
  overallProgressPercentage: number;
  totalTopics: number;
  completedTopics: number;
  learningTopics: number;
  needsRevisionTopics: number;
  totalStudySeconds: number;
}

// ==========================================
// PHASE 6: ACTIVITY, STREAKS & CONSISTENCY
// ==========================================

export const MIN_STUDY_MINUTES_FOR_ACTIVITY = 15;
export const MIN_STUDY_SECONDS_FOR_ACTIVITY = 900;

export function getActivityLevel(studySeconds: number): number {
  if (studySeconds < MIN_STUDY_SECONDS_FOR_ACTIVITY) return 0; // < 15 mins
  if (studySeconds < 1800) return 1; // 15–29 mins
  if (studySeconds < 3600) return 2; // 30–59 mins
  if (studySeconds < 7200) return 3; // 60–119 mins
  return 4; // 120+ mins
}

export const ActivityHeatmapQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  timezone: z.string().optional().default('UTC'),
});
export type ActivityHeatmapQueryDto = z.input<typeof ActivityHeatmapQuerySchema>;

export const ActivityQuerySchema = z.object({
  timezone: z.string().optional().default('UTC'),
});
export type ActivityQueryDto = z.input<typeof ActivityQuerySchema>;

export const ActivityHistoryQuerySchema = z.object({
  timezone: z.string().optional().default('UTC'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});
export type ActivityHistoryQueryDto = z.input<typeof ActivityHistoryQuerySchema>;

export interface DailyActivityItem {
  date: string; // YYYY-MM-DD
  studySeconds: number;
  sessions: number;
  topicsStudied: number;
  topicsCompleted: number;
  activityLevel: number; // 0..4
  isActive: boolean;
}

export interface ActivityHeatmapResponse {
  from: string;
  to: string;
  timezone: string;
  totalActiveDays: number;
  totalStudySeconds: number;
  days: DailyActivityItem[];
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  isTodayActive: boolean;
}

export interface WeeklyDayItem {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  studySeconds: number;
  isActive: boolean;
}

export interface WeeklyActivityResponse {
  days: WeeklyDayItem[];
  totalStudySeconds: number;
  activeDaysCount: number;
  totalDaysCount: number;
}

export interface ConsistencyStatsResponse {
  consistency7d: number; // Percentage 0..100
  consistency30d: number;
  consistency90d: number;
  activeDays7d: number;
  activeDays30d: number;
  activeDays90d: number;
}

export interface ActivityHistoryItemResponse {
  id: string;
  topicId: string;
  topicName: string;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectColorHex?: string | null;
  examId?: string | null;
  examTitle?: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  sessionType: SessionType;
  confidence?: number | null;
}

export interface ActivityHistoryResponse {
  data: ActivityHistoryItemResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ActivitySummaryResponse {
  today: DailySummaryResponse;
  streak: StreakResponse;
  weekly: WeeklyActivityResponse;
  consistency: ConsistencyStatsResponse;
}



