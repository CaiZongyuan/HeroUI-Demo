import type { LanguageModelV2FinishReason } from '@ai-sdk/provider';

export function mapAgentScopeFinishReason(status?: string): LanguageModelV2FinishReason {
  switch (status) {
    case 'completed':
      return 'stop';
    case 'failed':
      return 'error';
    case 'canceled':
      return 'other';
    case 'rejected':
      return 'content-filter';
    case 'in_progress':
    case 'created':
    case 'queued':
      return 'unknown';
    default:
      return 'unknown';
  }
}
