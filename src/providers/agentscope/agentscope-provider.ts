import { LanguageModelV2, NoSuchModelError, type ProviderV2 } from '@ai-sdk/provider';
import { withoutTrailingSlash } from '@ai-sdk/provider-utils';

import { AgentScopeChatLanguageModel, type AgentScopeLanguageModelConfig } from './agentscope-chat-language-model';

export interface AgentScopeProvider extends ProviderV2 {
  (modelId?: string): LanguageModelV2;
  languageModel(modelId?: string): LanguageModelV2;
}

export interface AgentScopeProviderSettings {
  baseURL?: string;
  streamPath?: string;
  processPath?: string;
  headers?: Record<string, string>;
  userId: string;
  sessionId?: string;
  fetch?: typeof fetch;
}

function buildConfig(settings: AgentScopeProviderSettings): AgentScopeLanguageModelConfig {
  const baseURL = withoutTrailingSlash(settings.baseURL) ?? 'http://localhost:8000';

  return {
    baseURL,
    streamPath: settings.streamPath ?? '/stream',
    processPath: settings.processPath ?? '/process',
    userId: settings.userId,
    sessionId: settings.sessionId,
    headers: settings.headers ? () => settings.headers as Record<string, string> : undefined,
    fetch: settings.fetch,
  };
}

export function createAgentScope(settings: AgentScopeProviderSettings): AgentScopeProvider {
  const config = buildConfig(settings);

  const createModel = (modelId?: string): LanguageModelV2 =>
    new AgentScopeChatLanguageModel(modelId ?? 'agentscope-runtime', config);

  const provider = (modelId?: string) => createModel(modelId);

  provider.languageModel = createModel;
  provider.textEmbeddingModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'textEmbeddingModel' });
  };
  provider.imageModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'imageModel' });
  };

  return provider as AgentScopeProvider;
}

const defaultUserId = process.env.AGENTSCOPE_USER_ID ?? 'demo-user';

export const agentscope = createAgentScope({
  baseURL: process.env.AGENTSCOPE_BASE_URL,
  userId: defaultUserId,
  sessionId: process.env.AGENTSCOPE_SESSION_ID,
});
