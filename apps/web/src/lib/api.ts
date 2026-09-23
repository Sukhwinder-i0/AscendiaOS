import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  CreateExamDto,
  UpdateExamDto,
  ExamResponse,
  CreateSubjectDto,
  CreateChapterDto,
  CreateTopicDto,
  UpdateNodeDto,
  MoveTopicDto,
  ReorderSyllabusDto,
  UpdateTopicProgressDto,
  SyllabusTreeResponse,
  DocumentResponse,
  ApproveSyllabusImportDto,
  CreateUrlResourceDto,
  CreateFileResourceDto,
  PresignUploadDto,
  CompletePresignedUploadDto,
  UpdateResourceDto,
  AssignResourceDto,
  MoveResourceDto,
  ResourceQueryDto,
  ResourceResponse,
  UrlMetadataResponse,
  CreateNoteDto,
  UpdateNoteDto,
  MoveNoteDto,
  NoteQueryDto,
  AttachResourceToNoteDto,
  NoteResponse,
  CreateStudySessionDto,
  FinishStudySessionDto,
  StudySessionQueryDto,
  StudySessionResponse,
  DailySummaryResponse,
  ActivityHeatmapQueryDto,
  ActivityHeatmapResponse,
  StreakResponse,
  WeeklyActivityResponse,
  ConsistencyStatsResponse,
  ActivityHistoryQueryDto,
  ActivityHistoryResponse,
  ActivitySummaryResponse,
  AnalyticsDashboardQueryDto,
  DashboardAnalyticsResponse,
  SubjectDetailAnalyticsResponse,
  TopicProgressQueryDto,
  PaginatedTopicProgressResponse,
  TrendPeriod,
} from '@ascendiaos/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studyos_token');
    }
    return null;
  }

  public setToken(token: string | null) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('studyos_token', token);
      } else {
        localStorage.removeItem('studyos_token');
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(data.message || `API Error: ${response.statusText}`) as any;
      err.data = data;
      err.status = response.status;
      throw err;
    }

    return data as T;
  }

  // Auth API
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async getMe(): Promise<AuthResponse['user']> {
    const res = await this.request<{ user: AuthResponse['user'] }>('/auth/me');
    return res.user;
  }

  logout() {
    this.setToken(null);
  }

  // Exams API
  async getExams(): Promise<ExamResponse[]> {
    return this.request<ExamResponse[]>('/exams');
  }

  async createExam(dto: CreateExamDto): Promise<ExamResponse> {
    return this.request<ExamResponse>('/exams', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getExam(id: string): Promise<ExamResponse> {
    return this.request<ExamResponse>(`/exams/${id}`);
  }

  async updateExam(id: string, dto: UpdateExamDto): Promise<ExamResponse> {
    return this.request<ExamResponse>(`/exams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async deleteExam(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  // Syllabus API
  async getSyllabusTree(examId: string): Promise<SyllabusTreeResponse> {
    return this.request<SyllabusTreeResponse>(`/exams/${examId}/syllabus`);
  }

  async createSubject(examId: string, dto: CreateSubjectDto) {
    return this.request(`/exams/${examId}/subjects`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateSubject(id: string, dto: UpdateNodeDto) {
    return this.request(`/subjects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async deleteSubject(id: string) {
    return this.request(`/subjects/${id}`, { method: 'DELETE' });
  }

  async createChapter(subjectId: string, dto: CreateChapterDto) {
    return this.request(`/subjects/${subjectId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateChapter(id: string, dto: UpdateNodeDto) {
    return this.request(`/chapters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async deleteChapter(id: string) {
    return this.request(`/chapters/${id}`, { method: 'DELETE' });
  }

  async createTopic(chapterId: string, dto: CreateTopicDto) {
    return this.request(`/chapters/${chapterId}/topics`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateTopic(id: string, dto: UpdateNodeDto) {
    return this.request(`/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async moveTopic(id: string, dto: MoveTopicDto) {
    return this.request(`/topics/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async deleteTopic(id: string) {
    return this.request(`/topics/${id}`, { method: 'DELETE' });
  }

  async reorderSyllabus(dto: ReorderSyllabusDto) {
    return this.request('/syllabus/reorder', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateTopicProgress(id: string, dto: UpdateTopicProgressDto) {
    return this.request(`/topics/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  // Syllabus Import API
  async uploadSyllabus(file: File, examId?: string): Promise<DocumentResponse> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/syllabus-import/upload${examId ? `?examId=${examId}` : ''}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Upload failed: ${response.statusText}`);
    }

    return data as DocumentResponse;
  }

  async getImportDocument(id: string): Promise<DocumentResponse> {
    return this.request<DocumentResponse>(`/syllabus-import/documents/${id}`);
  }

  async approveSyllabusImport(
    id: string,
    dto: ApproveSyllabusImportDto,
  ): Promise<{ success: boolean; examId: string }> {
    return this.request<{ success: boolean; examId: string }>(
      `/syllabus-import/documents/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    );
  }

  // Resources API
  async createUrlResource(dto: CreateUrlResourceDto): Promise<ResourceResponse> {
    return this.request<ResourceResponse>('/resources/url', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async uploadFileResource(file: File, dto: CreateFileResourceDto): Promise<ResourceResponse> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', dto.title);
    if (dto.description) formData.append('description', dto.description);
    if (dto.locationType) formData.append('locationType', dto.locationType);
    if (dto.examId) formData.append('examId', dto.examId);
    if (dto.subjectId) formData.append('subjectId', dto.subjectId);
    if (dto.chapterId) formData.append('chapterId', dto.chapterId);
    if (dto.topicId) formData.append('topicId', dto.topicId);

    const response = await fetch(`${API_BASE}/resources/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `File upload failed: ${response.statusText}`);
    }

    return data as ResourceResponse;
  }

  async getPresignedUpload(dto: PresignUploadDto): Promise<{ uploadUrl: string; storageKey: string }> {
    return this.request<{ uploadUrl: string; storageKey: string }>('/resources/presign', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async completePresignedUpload(dto: CompletePresignedUploadDto): Promise<ResourceResponse> {
    return this.request<ResourceResponse>('/resources/complete-upload', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getResources(
    query: ResourceQueryDto = {},
  ): Promise<{ items: ResourceResponse[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.type) params.append('type', query.type);
    if (query.locationType) params.append('locationType', query.locationType);
    if (query.examId) params.append('examId', query.examId);
    if (query.subjectId) params.append('subjectId', query.subjectId);
    if (query.chapterId) params.append('chapterId', query.chapterId);
    if (query.topicId) params.append('topicId', query.topicId);
    if (query.isCompleted !== undefined) params.append('isCompleted', String(query.isCompleted));
    if (query.isAssigned !== undefined) params.append('isAssigned', String(query.isAssigned));
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ items: ResourceResponse[]; total: number; page: number; limit: number }>(
      `/resources${queryStr}`,
    );
  }

  async getInbox(): Promise<ResourceResponse[]> {
    return this.request<ResourceResponse[]>('/resources/inbox');
  }

  async detectUrlMetadata(url: string): Promise<UrlMetadataResponse> {
    return this.request<UrlMetadataResponse>(`/resources/detect-url?url=${encodeURIComponent(url)}`);
  }

  async getResourceById(id: string): Promise<ResourceResponse> {
    return this.request<ResourceResponse>(`/resources/${id}`);
  }

  async getDownloadUrl(id: string): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>(`/resources/${id}/download`);
  }

  async updateResource(id: string, dto: UpdateResourceDto): Promise<ResourceResponse> {
    return this.request<ResourceResponse>(`/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async assignResource(id: string, dto: AssignResourceDto): Promise<ResourceResponse> {
    return this.request<ResourceResponse>(`/resources/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async moveResource(id: string, dto: MoveResourceDto): Promise<ResourceResponse> {
    return this.request<ResourceResponse>(`/resources/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async deleteResource(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/resources/${id}`, {
      method: 'DELETE',
    });
  }

  // Notes API
  async createNote(dto: CreateNoteDto): Promise<NoteResponse> {
    return this.request<NoteResponse>('/notes', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getNotes(
    query: NoteQueryDto = {},
  ): Promise<{ items: NoteResponse[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.examId) params.append('examId', query.examId);
    if (query.subjectId) params.append('subjectId', query.subjectId);
    if (query.chapterId) params.append('chapterId', query.chapterId);
    if (query.topicId) params.append('topicId', query.topicId);
    if (query.isPinned !== undefined) params.append('isPinned', String(query.isPinned));
    if (query.isArchived !== undefined) params.append('isArchived', String(query.isArchived));
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ items: NoteResponse[]; total: number; page: number; limit: number }>(
      `/notes${queryStr}`,
    );
  }

  async getNoteById(id: string): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}`);
  }

  async updateNote(id: string, dto: UpdateNoteDto): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async pinNote(id: string): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}/pin`, {
      method: 'POST',
    });
  }

  async unpinNote(id: string): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}/pin`, {
      method: 'DELETE',
    });
  }

  async archiveNote(id: string): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}/archive`, {
      method: 'POST',
    });
  }

  async unarchiveNote(id: string): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}/archive`, {
      method: 'DELETE',
    });
  }

  async moveNote(id: string, dto: MoveNoteDto): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async attachResourceToNote(id: string, resourceId: string): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}/resources`, {
      method: 'POST',
      body: JSON.stringify({ resourceId }),
    });
  }

  async detachResourceFromNote(id: string, resourceId: string): Promise<NoteResponse> {
    return this.request<NoteResponse>(`/notes/${id}/resources/${resourceId}`, {
      method: 'DELETE',
    });
  }

  async deleteNote(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Study Sessions API
  async createStudySession(dto: CreateStudySessionDto): Promise<StudySessionResponse> {
    return this.request<StudySessionResponse>('/study-sessions', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getActiveStudySession(): Promise<StudySessionResponse | null> {
    return this.request<StudySessionResponse | null>('/study-sessions/active');
  }

  async getDailySummary(dateStr?: string, timezone?: string): Promise<DailySummaryResponse> {
    const params = new URLSearchParams();
    if (dateStr) params.append('date', dateStr);
    if (timezone) params.append('timezone', timezone);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<DailySummaryResponse>(`/study-sessions/summary/today${queryStr}`);
  }

  async getStudySessions(
    query: StudySessionQueryDto = {},
  ): Promise<{ data: StudySessionResponse[]; meta: any }> {
    const params = new URLSearchParams();
    if (query.topicId) params.append('topicId', query.topicId);
    if (query.subjectId) params.append('subjectId', query.subjectId);
    if (query.examId) params.append('examId', query.examId);
    if (query.sessionType) params.append('sessionType', query.sessionType);
    if (query.status) params.append('status', query.status);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.timezone) params.append('timezone', query.timezone);
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: StudySessionResponse[]; meta: any }>(`/study-sessions${queryStr}`);
  }

  async getStudySessionById(id: string): Promise<StudySessionResponse> {
    return this.request<StudySessionResponse>(`/study-sessions/${id}`);
  }

  async startStudySession(id: string): Promise<StudySessionResponse> {
    return this.request<StudySessionResponse>(`/study-sessions/${id}/start`, {
      method: 'POST',
    });
  }

  async pauseStudySession(id: string): Promise<StudySessionResponse> {
    return this.request<StudySessionResponse>(`/study-sessions/${id}/pause`, {
      method: 'POST',
    });
  }

  async resumeStudySession(id: string): Promise<StudySessionResponse> {
    return this.request<StudySessionResponse>(`/study-sessions/${id}/resume`, {
      method: 'POST',
    });
  }

  async finishStudySession(id: string, dto?: FinishStudySessionDto): Promise<StudySessionResponse> {
    return this.request<StudySessionResponse>(`/study-sessions/${id}/finish`, {
      method: 'POST',
      body: dto ? JSON.stringify(dto) : undefined,
    });
  }

  async discardStudySession(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/study-sessions/${id}/discard`, {
      method: 'POST',
    });
  }

  // Activity & Streak API
  async getActivitySummary(timezone?: string): Promise<ActivitySummaryResponse> {
    const params = new URLSearchParams();
    if (timezone) params.append('timezone', timezone);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<ActivitySummaryResponse>(`/activity/summary${queryStr}`);
  }

  async getDailyActivityToday(timezone?: string): Promise<DailySummaryResponse> {
    const params = new URLSearchParams();
    if (timezone) params.append('timezone', timezone);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<DailySummaryResponse>(`/activity/today${queryStr}`);
  }

  async getActivityHeatmap(
    from?: string,
    to?: string,
    timezone?: string,
  ): Promise<ActivityHeatmapResponse> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (timezone) params.append('timezone', timezone);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<ActivityHeatmapResponse>(`/activity/heatmap${queryStr}`);
  }

  async getStreak(timezone?: string): Promise<StreakResponse> {
    const params = new URLSearchParams();
    if (timezone) params.append('timezone', timezone);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<StreakResponse>(`/activity/streak${queryStr}`);
  }

  async getWeeklyActivity(timezone?: string): Promise<WeeklyActivityResponse> {
    const params = new URLSearchParams();
    if (timezone) params.append('timezone', timezone);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<WeeklyActivityResponse>(`/activity/weekly${queryStr}`);
  }

  async getConsistencyStats(timezone?: string): Promise<ConsistencyStatsResponse> {
    const params = new URLSearchParams();
    if (timezone) params.append('timezone', timezone);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<ConsistencyStatsResponse>(`/activity/consistency${queryStr}`);
  }

  async getActivityHistory(
    query: ActivityHistoryQueryDto = {},
  ): Promise<ActivityHistoryResponse> {
    const params = new URLSearchParams();
    if (query.timezone) params.append('timezone', query.timezone);
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<ActivityHistoryResponse>(`/activity/history${queryStr}`);
  }

  // Analytics API
  async getDashboardAnalytics(
    query: AnalyticsDashboardQueryDto = {},
  ): Promise<DashboardAnalyticsResponse> {
    const params = new URLSearchParams();
    if (query.examId) params.append('examId', query.examId);
    if (query.timezone) params.append('timezone', query.timezone);
    if (query.trendPeriod) params.append('trendPeriod', query.trendPeriod);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<DashboardAnalyticsResponse>(`/analytics/dashboard${queryStr}`);
  }

  async getSubjectAnalytics(
    subjectId: string,
    timezone?: string,
  ): Promise<SubjectDetailAnalyticsResponse> {
    const params = new URLSearchParams();
    if (timezone) params.append('timezone', timezone);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<SubjectDetailAnalyticsResponse>(
      `/analytics/subjects/${subjectId}${queryStr}`,
    );
  }

  async getTopicProgressOverview(
    query: TopicProgressQueryDto = {},
    timezone?: string,
  ): Promise<PaginatedTopicProgressResponse> {
    const params = new URLSearchParams();
    if (query.examId) params.append('examId', query.examId);
    if (query.status) params.append('status', query.status);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (timezone) params.append('timezone', timezone);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<PaginatedTopicProgressResponse>(
      `/analytics/topic-progress${queryStr}`,
    );
  }
}

export const api = new ApiClient();
