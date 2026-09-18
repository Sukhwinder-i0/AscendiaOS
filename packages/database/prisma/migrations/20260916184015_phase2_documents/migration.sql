-- CreateEnum
CREATE TYPE "DocumentProcessingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'EXTRACTED', 'ANALYZED', 'READY_FOR_REVIEW', 'APPROVED', 'FAILED');

-- CreateEnum
CREATE TYPE "SyllabusDocumentType" AS ENUM ('FULL_EXAM_SYLLABUS', 'SUBJECT_SYLLABUS', 'CHAPTER_OR_TOPIC_DOCUMENT', 'UNKNOWN');

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "DocumentProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "documentType" "SyllabusDocumentType",
    "aiConfidence" DOUBLE PRECISION,
    "extractedText" TEXT,
    "extractedHierarchy" JSONB,
    "warnings" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "documents_examId_idx" ON "documents"("examId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
