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
} from '@studyos/shared';

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
      throw new Error(data.message || `API Error: ${response.statusText}`);
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
}

export const api = new ApiClient();
