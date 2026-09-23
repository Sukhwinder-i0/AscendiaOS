import { ExtractedHierarchy } from '@ascendiaos/shared';

export const AI_PROVIDER = 'AI_PROVIDER';

export interface AIProvider {
  analyzeSyllabusText(extractedText: string): Promise<ExtractedHierarchy>;
}
