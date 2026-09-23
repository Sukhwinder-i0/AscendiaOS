import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { DatabaseService } from '../database/database.service';

describe('NotesService', () => {
  let service: NotesService;
  let db: any;

  const mockUser = { id: 'user-1' };
  const mockUser2 = { id: 'user-2' };

  const mockNote = {
    id: 'note-1',
    userId: 'user-1',
    title: 'Bayes Theorem Formula Sheet',
    content: '# Bayes Theorem\n\n$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$',
    contentFormat: 'MARKDOWN',
    isPinned: false,
    isArchived: false,
    examId: 'exam-1',
    subjectId: 'sub-1',
    chapterId: 'chap-1',
    topicId: 'topic-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    exam: { id: 'exam-1', title: 'GATE / UGC / UPSC' },
    subject: { id: 'sub-1', name: 'Probability' },
    chapter: { id: 'chap-1', name: 'Probability Rules' },
    topic: { id: 'topic-1', name: 'Bayes Theorem' },
    resources: [],
  };

  beforeEach(async () => {
    db = {
      note: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      noteResource: {
        upsert: jest.fn(),
        delete: jest.fn(),
      },
      topic: {
        findFirst: jest.fn(),
      },
      chapter: {
        findFirst: jest.fn(),
      },
      subject: {
        findFirst: jest.fn(),
      },
      exam: {
        findFirst: jest.fn(),
      },
      resource: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  describe('createNote', () => {
    it('should create a note inheriting hierarchy context from target topic', async () => {
      db.topic.findFirst.mockResolvedValue({
        id: 'topic-1',
        name: 'Bayes Theorem',
        chapterId: 'chap-1',
        chapter: {
          id: 'chap-1',
          subjectId: 'sub-1',
          subject: {
            id: 'sub-1',
            examId: 'exam-1',
          },
        },
      });

      db.note.create.mockResolvedValue(mockNote);

      const result = await service.createNote(mockUser.id, {
        title: 'Bayes Theorem Formula Sheet',
        topicId: 'topic-1',
      });

      expect(db.note.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            title: 'Bayes Theorem Formula Sheet',
            examId: 'exam-1',
            subjectId: 'sub-1',
            chapterId: 'chap-1',
            topicId: 'topic-1',
          }),
        }),
      );
      expect(result.id).toBe('note-1');
      expect(result.title).toBe('Bayes Theorem Formula Sheet');
    });

    it('should pre-populate note content when a template is specified', async () => {
      db.note.create.mockImplementation((args: any) =>
        Promise.resolve({
          ...mockNote,
          content: args.data.content,
        }),
      );

      const result = await service.createNote(mockUser.id, {
        title: 'Formula Sheet',
        template: 'FORMULA_SHEET',
      });

      expect(result.content).toContain('Key Formulas');
      expect(result.content).toContain('Solved Example');
    });
  });

  describe('getNotes', () => {
    it('should query notes with search term and pagination', async () => {
      db.note.findMany.mockResolvedValue([mockNote]);
      db.note.count.mockResolvedValue(1);

      const result = await service.getNotes(mockUser.id, {
        search: 'Bayes',
        page: 1,
        limit: 10,
      });

      expect(db.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            OR: [
              { title: { contains: 'Bayes', mode: 'insensitive' } },
              { content: { contains: 'Bayes', mode: 'insensitive' } },
            ],
          }),
        }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].snippet).toBeDefined();
    });
  });

  describe('user isolation & authorization', () => {
    it('should throw NotFoundException when getting a note belonging to another user', async () => {
      db.note.findFirst.mockResolvedValue(null);

      await expect(service.getNoteById(mockUser2.id, 'note-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if attaching a resource belonging to another user', async () => {
      db.note.findFirst.mockResolvedValue(mockNote);
      db.resource.findFirst.mockResolvedValue(null);

      await expect(
        service.attachResource(mockUser.id, 'note-1', { resourceId: 'foreign-res' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('pinning & archiving', () => {
    it('should toggle pin status on note', async () => {
      db.note.findFirst.mockResolvedValue(mockNote);
      db.note.update.mockResolvedValue({ ...mockNote, isPinned: true });

      const result = await service.togglePin(mockUser.id, 'note-1');
      expect(result.isPinned).toBe(true);
    });

    it('should toggle archive status on note', async () => {
      db.note.findFirst.mockResolvedValue(mockNote);
      db.note.update.mockResolvedValue({ ...mockNote, isArchived: true });

      const result = await service.toggleArchive(mockUser.id, 'note-1');
      expect(result.isArchived).toBe(true);
    });
  });

  describe('attaching and detaching resources', () => {
    it('should attach a valid user resource to note', async () => {
      db.note.findFirst.mockResolvedValue(mockNote);
      db.resource.findFirst.mockResolvedValue({ id: 'res-1', userId: 'user-1' });

      await service.attachResource(mockUser.id, 'note-1', { resourceId: 'res-1' });

      expect(db.noteResource.upsert).toHaveBeenCalledWith({
        where: {
          noteId_resourceId: {
            noteId: 'note-1',
            resourceId: 'res-1',
          },
        },
        create: {
          noteId: 'note-1',
          resourceId: 'res-1',
        },
        update: {},
      });
    });
  });

  describe('deleteNote', () => {
    it('should delete note database record', async () => {
      db.note.findFirst.mockResolvedValue(mockNote);
      db.note.delete.mockResolvedValue(mockNote);

      const result = await service.deleteNote(mockUser.id, 'note-1');
      expect(db.note.delete).toHaveBeenCalledWith({ where: { id: 'note-1' } });
      expect(result.success).toBe(true);
    });
  });
});
