import { MockAIProvider } from './mock-ai.provider';

describe('MockAIProvider', () => {
  let provider: MockAIProvider;

  beforeEach(() => {
    provider = new MockAIProvider();
  });

  it('should dynamically parse section headers and comma-separated topics from syllabus text', async () => {
    const rawText = `
GATE 2027 IIT Madras
DA Data Science and Artificial Intelligence
Section 1: Probability and Statistics
Counting (permutation and combinations), probability axioms, Sample space, events, independent events, Bayes Theorem, random variables, mean, median, mode.
Section 2: Linear Algebra
Vector space, subspaces, linear dependence and independence of vectors, matrices, Gaussian elimination, eigenvalues and eigenvectors.
`;

    const res = await provider.analyzeSyllabusText(rawText);

    expect(res.documentType).toBe('FULL_EXAM_SYLLABUS');
    expect(res.subjects.length).toBe(2);
    expect(res.subjects[0].name).toContain('Probability and Statistics');
    expect(res.subjects[1].name).toContain('Linear Algebra');

    const probTopics = res.subjects[0].chapters[0].topics;
    expect(probTopics.some((t) => t.name.includes('Bayes Theorem'))).toBe(true);
    expect(probTopics.some((t) => t.name.includes('Sample space'))).toBe(true);

    const linearTopics = res.subjects[1].chapters[0].topics;
    expect(linearTopics.some((t) => t.name.includes('Gaussian elimination'))).toBe(true);
  });
});
