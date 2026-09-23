import { PrismaClient, ProgressStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@studyos.com' },
    update: {},
    create: {
      email: 'demo@studyos.com',
      passwordHash,
      fullName: 'Demo Student',
    },
  });

  console.log(`User created: ${user.email} (ID: ${user.id})`);

  // 2. Check if Exam already exists for user
  const existingExam = await prisma.exam.findFirst({
    where: { userId: user.id },
  });

  if (existingExam) {
    console.log('Sample exam already exists. Skipping syllabus creation.');
    return;
  }

  // 3. Create Sample GATE / UGC / UPSC Exam
  const exam = await prisma.exam.create({
    data: {
      userId: user.id,
      title: 'GATE / UGC / UPSC 2027',
      code: 'GATE-UGC-UPSC',
      targetDate: new Date('2027-02-01'),
      targetScore: 85,
      targetRank: 100,
      dailyGoalHours: 4.0,
    },
  });

  console.log(`Exam created: ${exam.title} (ID: ${exam.id})`);

  // 4. Create Subjects
  const probabilitySubject = await prisma.subject.create({
    data: {
      examId: exam.id,
      userId: user.id,
      name: 'Probability & Statistics',
      code: 'MATH-PROB',
      colorHex: '#6366F1',
      orderIndex: 0,
    },
  });

  const linearAlgebraSubject = await prisma.subject.create({
    data: {
      examId: exam.id,
      userId: user.id,
      name: 'Linear Algebra',
      code: 'MATH-LA',
      colorHex: '#3B82F6',
      orderIndex: 1,
    },
  });

  // 5. Create Chapters for Probability & Statistics
  const probChapter = await prisma.chapter.create({
    data: {
      subjectId: probabilitySubject.id,
      userId: user.id,
      name: 'Probability',
      orderIndex: 0,
    },
  });

  const statsChapter = await prisma.chapter.create({
    data: {
      subjectId: probabilitySubject.id,
      userId: user.id,
      name: 'Statistics',
      orderIndex: 1,
    },
  });

  // 6. Create Topics under Probability Chapter
  const condProbTopic = await prisma.topic.create({
    data: {
      chapterId: probChapter.id,
      userId: user.id,
      name: 'Conditional Probability',
      orderIndex: 0,
      progress: {
        create: {
          userId: user.id,
          status: ProgressStatus.COMPLETED,
          confidenceScore: 4,
          totalStudyTimeSec: 3600,
        },
      },
    },
  });

  const bayesTopic = await prisma.topic.create({
    data: {
      chapterId: probChapter.id,
      userId: user.id,
      name: 'Bayes Theorem',
      orderIndex: 1,
      progress: {
        create: {
          userId: user.id,
          status: ProgressStatus.LEARNING,
          confidenceScore: 3,
          totalStudyTimeSec: 1800,
        },
      },
    },
  });

  // Nested Subtopic under Bayes Theorem
  await prisma.topic.create({
    data: {
      chapterId: probChapter.id,
      userId: user.id,
      parentId: bayesTopic.id,
      name: 'Prior and Posterior Probabilities',
      orderIndex: 0,
      progress: {
        create: {
          userId: user.id,
          status: ProgressStatus.NOT_STARTED,
          confidenceScore: 1,
        },
      },
    },
  });

  const rvTopic = await prisma.topic.create({
    data: {
      chapterId: probChapter.id,
      userId: user.id,
      name: 'Random Variables',
      orderIndex: 2,
      progress: {
        create: {
          userId: user.id,
          status: ProgressStatus.NOT_STARTED,
          confidenceScore: 1,
        },
      },
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
