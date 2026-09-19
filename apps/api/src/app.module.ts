import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ExamsModule } from './exams/exams.module';
import { SyllabusModule } from './syllabus/syllabus.module';
import { SyllabusImportModule } from './syllabus-import/syllabus-import.module';
import { ResourcesModule } from './resources/resources.module';
import { NotesModule } from './notes/notes.module';
import { StudySessionsModule } from './study-sessions/study-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    AuthModule,
    ExamsModule,
    SyllabusModule,
    SyllabusImportModule,
    ResourcesModule,
    NotesModule,
    StudySessionsModule,
  ],
})
export class AppModule {}
