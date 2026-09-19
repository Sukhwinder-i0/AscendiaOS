import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotesService } from './notes.service';
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  MoveNoteSchema,
  NoteQuerySchema,
  AttachResourceToNoteSchema,
} from '@studyos/shared';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async createNote(@Req() req: any, @Body() body: any) {
    const validated = CreateNoteSchema.parse(body);
    return this.notesService.createNote(req.user.id, validated);
  }

  @Get()
  async getNotes(@Req() req: any, @Query() query: any) {
    const parsedQuery = NoteQuerySchema.parse({
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      isPinned: query.isPinned !== undefined ? query.isPinned === 'true' : undefined,
      isArchived: query.isArchived !== undefined ? query.isArchived === 'true' : undefined,
    });
    return this.notesService.getNotes(req.user.id, parsedQuery);
  }

  @Get(':id')
  async getNoteById(@Req() req: any, @Param('id') id: string) {
    return this.notesService.getNoteById(req.user.id, id);
  }

  @Patch(':id')
  async updateNote(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const validated = UpdateNoteSchema.parse(body);
    return this.notesService.updateNote(req.user.id, id, validated);
  }

  @Post(':id/pin')
  async pinNote(@Req() req: any, @Param('id') id: string) {
    return this.notesService.togglePin(req.user.id, id, true);
  }

  @Delete(':id/pin')
  async unpinNote(@Req() req: any, @Param('id') id: string) {
    return this.notesService.togglePin(req.user.id, id, false);
  }

  @Post(':id/archive')
  async archiveNote(@Req() req: any, @Param('id') id: string) {
    return this.notesService.toggleArchive(req.user.id, id, true);
  }

  @Delete(':id/archive')
  async unarchiveNote(@Req() req: any, @Param('id') id: string) {
    return this.notesService.toggleArchive(req.user.id, id, false);
  }

  @Post(':id/move')
  async moveNote(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const validated = MoveNoteSchema.parse(body);
    return this.notesService.moveNote(req.user.id, id, validated);
  }

  @Post(':id/resources')
  async attachResource(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const validated = AttachResourceToNoteSchema.parse(body);
    return this.notesService.attachResource(req.user.id, id, validated);
  }

  @Delete(':id/resources/:resourceId')
  async detachResource(
    @Req() req: any,
    @Param('id') id: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.notesService.detachResource(req.user.id, id, resourceId);
  }

  @Delete(':id')
  async deleteNote(@Req() req: any, @Param('id') id: string) {
    return this.notesService.deleteNote(req.user.id, id);
  }
}
