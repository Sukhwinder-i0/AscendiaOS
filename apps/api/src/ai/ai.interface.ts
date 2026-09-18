import { ExtractedHierarchy } from '@studyos/shared';

export const AI_PROVIDER = 'AI_PROVIDER';

export interface AIProvider {
  analyzeSyllabusText(extractedText: string): Promise<ExtractedHierarchy>;
}
