import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AI_PROVIDER } from './ai.interface';
import { OpenAIProvider } from './openai-ai.provider';
import { MockAIProvider } from './mock-ai.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AI_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const providerName = configService.get<string>('AI_PROVIDER') || 'mock';
        const apiKey = configService.get<string>('OPENAI_API_KEY');

        if (providerName === 'openai' && apiKey) {
          return new OpenAIProvider(configService);
        }

        return new MockAIProvider();
      },
      inject: [ConfigService],
    },
  ],
  exports: [AI_PROVIDER],
})
export class AIModule {}
