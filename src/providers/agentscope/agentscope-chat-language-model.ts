import {
  InvalidArgumentError,
  InvalidResponseDataError,
  NoContentGeneratedError,
  type LanguageModelV2,
  type LanguageModelV2CallOptions,
  type LanguageModelV2CallWarning,
  type LanguageModelV2Content,
  type LanguageModelV2FinishReason,
  type LanguageModelV2StreamPart,
  type LanguageModelV2Usage,
} from '@ai-sdk/provider';
import {
  combineHeaders,
  extractResponseHeaders,
  parseProviderOptions,
} from '@ai-sdk/provider-utils';
import { EventSourceParserStream } from 'eventsource-parser/stream';
import { z } from 'zod';

import { assertObject, buildAgentScopeAPIError } from './agentscope-error';
import {
  type AgentScopeMessagePayload,
  convertToAgentScopeMessages,
} from './convert-to-agentscope-messages';
import { mapAgentScopeFinishReason } from './map-agentscope-finish-reason';

type AgentScopeContentEvent = {
  object?: string;
  type?: string;
  status?: string;
  text?: string;
  delta?: boolean;
  msg_id?: string;
  index?: number;
};

type AgentScopeMessage = {
  id?: string;
  object?: string;
  type?: string;
  role?: string;
  status?: string;
  content?: AgentScopeContentEvent[];
  code?: string | null;
  message?: string | null;
};

type AgentScopeResponse = {
  id?: string;
  object?: string;
  status?: string;
  output?: AgentScopeMessage[];
  usage?: Record<string, unknown>;
  error?: { code?: string; message?: string };
};

export const agentScopeProviderOptionsSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export type AgentScopeProviderOptions = z.infer<typeof agentScopeProviderOptionsSchema>;

export interface AgentScopeLanguageModelConfig {
  baseURL: string;
  streamPath: string;
  processPath: string;
  userId: string;
  sessionId?: string;
  headers?: () => Record<string, string>;
  fetch?: typeof fetch;
}

export class AgentScopeChatLanguageModel implements LanguageModelV2 {
  readonly specificationVersion = 'v2' as const;
  readonly supportedUrls = {};

  constructor(
    readonly modelId: string,
    private readonly config: AgentScopeLanguageModelConfig,
  ) {}

  get provider() {
    return 'agentscope';
  }

  private createBaseUsage(): LanguageModelV2Usage {
    return {
      inputTokens: undefined,
      outputTokens: undefined,
      totalTokens: undefined,
      reasoningTokens: undefined,
      cachedInputTokens: undefined,
    };
  }

  private collectWarnings(options: LanguageModelV2CallOptions): LanguageModelV2CallWarning[] {
    const warnings: LanguageModelV2CallWarning[] = [];

    if (options.tools && options.tools.length > 0) {
      options.tools.forEach((tool) => {
        warnings.push({ type: 'unsupported-tool', tool, details: 'AgentScope 暂未对接 AI SDK 工具调用' });
      });
    }

    if (options.toolChoice) {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'toolChoice',
        details: 'AgentScope 暂未对接 toolChoice 控制项',
      });
    }

    if (options.topK != null) {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'topK',
        details: 'AgentScope 不支持 topK，已忽略该设置',
      });
    }

    if (options.responseFormat && options.responseFormat.type === 'json') {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'responseFormat',
        details: 'AgentScope 当前仅支持文本输出',
      });
    }

    return warnings;
  }

  private normalizeUsage(raw?: Record<string, unknown>): LanguageModelV2Usage | undefined {
    if (!raw) {
      return undefined;
    }

    const asNumber = (value: unknown): number | undefined =>
      typeof value === 'number' ? value : undefined;

    return {
      inputTokens:
        asNumber(raw.input_tokens) ??
        asNumber(raw.prompt_tokens) ??
        asNumber(raw.inputTokens) ??
        asNumber(raw.promptTokens),
      outputTokens:
        asNumber(raw.output_tokens) ??
        asNumber(raw.completion_tokens) ??
        asNumber(raw.outputTokens) ??
        asNumber(raw.completionTokens),
      totalTokens: asNumber(raw.total_tokens) ?? asNumber(raw.totalTokens),
      reasoningTokens: asNumber(raw.reasoning_tokens) ?? asNumber(raw.reasoningTokens),
      cachedInputTokens: asNumber(raw.cached_input_tokens) ?? asNumber(raw.cachedInputTokens),
    };
  }

  private extractTextFromMessage(message?: AgentScopeMessage): string | undefined {
    if (!message?.content) {
      return undefined;
    }

    const textParts = message.content
      .filter((part) => part?.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text as string);

    if (textParts.length === 0) {
      return undefined;
    }

    return textParts.join('');
  }

  private convertMessageContent(message?: AgentScopeMessage): LanguageModelV2Content[] {
    const text = this.extractTextFromMessage(message);
    if (!text) {
      return [];
    }

    return [
      {
        type: 'text',
        text,
      },
    ];
  }

  private getRequestBody(options: LanguageModelV2CallOptions, providerOptions?: AgentScopeProviderOptions) {
    const messages: AgentScopeMessagePayload[] = convertToAgentScopeMessages(options.prompt);

    const userId = providerOptions?.userId ?? this.config.userId;
    const sessionId = providerOptions?.sessionId ?? this.config.sessionId;
    if (!userId) {
      throw new InvalidArgumentError({ argument: 'userId', message: 'user_id 不能为空' });
    }

    return {
      user_id: userId,
      session_id: sessionId,
      input: messages,
      stream: true,
      temperature: options.temperature,
      top_p: options.topP,
      presence_penalty: options.presencePenalty,
      frequency_penalty: options.frequencyPenalty,
      max_tokens: options.maxOutputTokens,
      stop: options.stopSequences,
      seed: options.seed,
      model: this.modelId,
    };
  }

  async doGenerate(options: LanguageModelV2CallOptions) {
    const providerOptions = await parseProviderOptions({
      provider: this.provider,
      providerOptions: options.providerOptions,
      schema: agentScopeProviderOptionsSchema,
    });
    const warnings = this.collectWarnings(options);
    const body = this.getRequestBody(options, providerOptions);

    const url = `${this.config.baseURL}${this.config.processPath}`;
    const headers = combineHeaders(
      this.config.headers?.(),
      options.headers,
      providerOptions?.headers,
    );

    const response = await (this.config.fetch ?? fetch)(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      throw await buildAgentScopeAPIError({
        response,
        url,
        requestBodyValues: body,
      });
    }

    let parsed: AgentScopeResponse;
    try {
      parsed = (await response.json()) as AgentScopeResponse;
    } catch (error) {
      throw new InvalidResponseDataError({
        message: 'AgentScope 响应 JSON 解析失败',
        data: error,
      });
    }

    assertObject(parsed, 'AgentScope 响应');
    if (parsed.error) {
      throw new InvalidResponseDataError({
        message: parsed.error.message ?? 'AgentScope 返回错误',
        data: parsed,
      });
    }

    const messages = Array.isArray(parsed.output) ? parsed.output : [];
    const lastAssistant =
      messages
        .filter((msg) => msg?.role === 'assistant')
        .slice(-1)[0] ?? messages.slice(-1)[0];

    const content = this.convertMessageContent(lastAssistant);
    if (content.length === 0) {
      throw new NoContentGeneratedError({ message: 'AgentScope 未返回文本内容' });
    }

    const finishReason = mapAgentScopeFinishReason(parsed.status ?? lastAssistant?.status);
    const usage = this.normalizeUsage(parsed.usage) ?? this.createBaseUsage();

    return {
      content,
      finishReason,
      usage,
      request: { body },
      response: {
        headers: extractResponseHeaders(response),
        body: parsed,
      },
      warnings,
    };
  }

  async doStream(options: LanguageModelV2CallOptions) {
    const providerOptions = await parseProviderOptions({
      provider: this.provider,
      providerOptions: options.providerOptions,
      schema: agentScopeProviderOptionsSchema,
    });
    const warnings = this.collectWarnings(options);
    const body = this.getRequestBody(options, providerOptions);

    const url = `${this.config.baseURL}${this.config.streamPath}`;
    const headers = combineHeaders(
      this.config.headers?.(),
      options.headers,
      providerOptions?.headers,
    );

    const response = await (this.config.fetch ?? fetch)(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      throw await buildAgentScopeAPIError({
        response,
        url,
        requestBodyValues: body,
      });
    }

    if (!response.body) {
      throw new InvalidResponseDataError({
        message: 'AgentScope 流式响应为空',
        data: null,
      });
    }

    const usage = this.createBaseUsage();
    let finishReason: LanguageModelV2FinishReason = 'unknown';
    let textId: string | undefined;
    let reasoningId: string | undefined;
    let responseId: string | undefined;
    const startedTextIds = new Set<string>();
    const startedReasoningIds = new Set<string>();
    const startedToolCalls = new Set<string>();
    const warnedUnknownEvents = new Set<string>();
    const warnOnce = (key: string, message: string) => {
      if (warnedUnknownEvents.has(key)) {
        return;
      }
      warnedUnknownEvents.add(key);
      // 记录未覆盖的事件，便于后续补充解析逻辑
      console.warn(message);
    };
    const ensureToolCallStarted = (
      controller: TransformStreamDefaultController<LanguageModelV2StreamPart>,
      toolCallId: string,
      toolName: string,
      input?: string,
    ) => {
      if (startedToolCalls.has(toolCallId)) {
        return;
      }
      startedToolCalls.add(toolCallId);
      // 直接推送一个 tool-call，确保后续 tool-result/tool-error 不会因缺少前置信息而报错
      controller.enqueue({
        type: 'tool-call',
        toolCallId,
        toolName,
        input: input ?? '',
        providerExecuted: true,
      });
    };
    const asString = (value: unknown): string | undefined =>
      typeof value === 'string' && value.trim() ? value : undefined;
    const normalizeToolInput = (raw: unknown): string => {
      if (typeof raw === 'string') {
        return raw;
      }
      if (raw == null) {
        return '';
      }
      try {
        return JSON.stringify(raw);
      } catch {
        return String(raw);
      }
    };
    const extractToolMeta = (payload: Record<string, unknown>, eventName?: string) => {
      let contentToolName: string | undefined;
      let contentToolId: string | undefined;
      let contentInput: unknown;
      let contentResult: unknown;

      if (Array.isArray(payload.content)) {
        for (const item of payload.content) {
          if (!item || typeof item !== 'object') {
            continue;
          }
          const recordItem = item as Record<string, unknown>;
          const data = recordItem.data;
          if (!data || typeof data !== 'object') {
            continue;
          }
          const dataRecord = data as Record<string, unknown>;
          contentToolName =
            contentToolName ??
            asString(dataRecord.name) ??
            asString(dataRecord.tool_name);
          contentToolId =
            contentToolId ??
            asString(dataRecord.id) ??
            asString(dataRecord.call_id);
          contentInput =
            contentInput ??
            (dataRecord.input ?? dataRecord.arguments ?? dataRecord.params);
          contentResult = contentResult ?? dataRecord.output ?? dataRecord.result;
        }
      }

      const toolName =
        asString(payload.name) ??
        asString(payload.tool_name) ??
        contentToolName ??
        eventName ??
        'plugin_call';
      const toolCallId =
        asString(payload.msg_id) ??
        asString(payload.call_id) ??
        asString(payload.id) ??
        contentToolId ??
        toolName ??
        'tool-call';

      return {
        toolName,
        toolCallId,
        input:
          payload.arguments ??
          payload.params ??
          payload.input ??
          payload.data ??
          contentInput,
        result: payload.output ?? payload.result ?? payload.data ?? contentResult,
      };
    };
    const resolveEventKind = (
      payload: Record<string, unknown>,
      eventName?: string,
    ): string | undefined =>
      asString(payload.type) ?? asString(payload.object) ?? eventName;

    const stream = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .pipeThrough(
        new TransformStream<{ event: string; data: string }, LanguageModelV2StreamPart>({
          start(controller) {
            controller.enqueue({ type: 'stream-start', warnings });
          },
          transform: (event, controller) => {
            if (!event?.data || event.data === '[DONE]') {
              return;
            }

            let parsed: unknown;
            try {
              parsed = JSON.parse(event.data);
            } catch (error) {
              controller.enqueue({ type: 'error', error });
              finishReason = 'error';
              return;
            }

            assertObject(parsed, 'AgentScope SSE 数据');

            const status = typeof parsed.status === 'string' ? parsed.status : undefined;
            if (status) {
              finishReason = mapAgentScopeFinishReason(status);
            }

            const ensureTextId = (candidate?: string) => {
              if (!textId) {
                const normalizedCandidate = candidate?.trim() || undefined;
                textId = normalizedCandidate ?? 'agentscope-text-0';
              }
              return textId;
            };

            const ensureReasoningId = (candidate?: string) => {
              if (!reasoningId) {
                const normalizedCandidate = candidate?.trim() || undefined;
                reasoningId = normalizedCandidate ?? 'agentscope-reasoning-0';
              }
              return reasoningId;
            };

            const enqueueTextDelta = (deltaText: string, candidateId?: string) => {
              const id = ensureTextId(candidateId);
              if (!startedTextIds.has(id)) {
                startedTextIds.add(id);
                controller.enqueue({ type: 'text-start', id });
              }
              controller.enqueue({ type: 'text-delta', id, delta: deltaText });
            };

            const enqueueReasoningDelta = (deltaText: string, candidateId?: string) => {
              const id = ensureReasoningId(candidateId);
              if (!startedReasoningIds.has(id)) {
                startedReasoningIds.add(id);
                controller.enqueue({ type: 'reasoning-start', id });
              }
              controller.enqueue({ type: 'reasoning-delta', id, delta: deltaText });
            };

            const parsedRecord = parsed as Record<string, unknown>;
            const eventName = typeof event.event === 'string' ? event.event : undefined;
            const eventKind = resolveEventKind(parsedRecord, eventName);
            const parsedObject = typeof parsed.object === 'string' ? parsed.object : undefined;
            const isReasoningObject =
              eventKind === 'reasoning' || parsedObject === 'reasoning' || parsed.type === 'reasoning';

            if (eventKind === 'response' || parsedObject === 'response') {
              if (!responseId && typeof parsed.id === 'string') {
                responseId = parsed.id;
                controller.enqueue({
                  type: 'response-metadata',
                  id: responseId,
                  modelId: this.modelId,
                });
              }
              const normalizedUsage = this.normalizeUsage(
                parsed.usage as Record<string, unknown> | undefined,
              );
              if (normalizedUsage) {
                usage.inputTokens = normalizedUsage.inputTokens;
                usage.outputTokens = normalizedUsage.outputTokens;
                usage.totalTokens = normalizedUsage.totalTokens;
                usage.reasoningTokens = normalizedUsage.reasoningTokens;
                usage.cachedInputTokens = normalizedUsage.cachedInputTokens;
              }
              return;
            }

            if (parsed.error) {
              controller.enqueue({ type: 'error', error: parsed.error });
              finishReason = 'error';
              return;
            }

            if (eventKind === 'message' || parsedObject === 'message') {
              if (Array.isArray(parsed.content)) {
                const text = this.extractTextFromMessage(parsed as AgentScopeMessage);
                if (text) {
                  const messageId = typeof parsed.id === 'string' ? parsed.id : undefined;
                  if (isReasoningObject) {
                    enqueueReasoningDelta(text, messageId);
                  } else {
                    enqueueTextDelta(text, messageId);
                  }
                }
              }
              return;
            }

            if (eventKind === 'plugin_call_output') {
              const toolMeta = extractToolMeta(parsedRecord, eventName);
              ensureToolCallStarted(
                controller,
                String(toolMeta.toolCallId),
                String(toolMeta.toolName ?? 'plugin_call_output'),
              );

              controller.enqueue({
                type: 'tool-result',
                toolCallId: String(toolMeta.toolCallId),
                toolName: String(toolMeta.toolName ?? 'plugin_call_output'),
                result: toolMeta.result ?? parsed,
                providerExecuted: true,
              });
              return;
            }

            if (eventKind === 'plugin_call') {
              const toolMeta = extractToolMeta(parsedRecord, eventName);
              const input = normalizeToolInput(toolMeta.input);
              ensureToolCallStarted(
                controller,
                String(toolMeta.toolCallId),
                String(toolMeta.toolName ?? 'plugin_call'),
                input,
              );

              controller.enqueue({
                type: 'tool-call',
                toolCallId: String(toolMeta.toolCallId),
                toolName: String(toolMeta.toolName ?? 'plugin_call'),
                input,
                providerExecuted: true,
              });
              return;
            }

            if (
              eventKind === 'content' ||
              eventKind === 'text' ||
              eventKind === 'reasoning' ||
              parsedObject === 'content' ||
              parsed.type === 'text' ||
              isReasoningObject
            ) {
              const text = typeof parsed.text === 'string' ? parsed.text : undefined;
              if (text) {
                const msgId = typeof parsed.msg_id === 'string' ? parsed.msg_id : undefined;
                if (isReasoningObject) {
                  enqueueReasoningDelta(text, msgId);
                } else {
                  enqueueTextDelta(text, msgId);
                }
              }
              return;
            }

            const unknownKey = eventKind || parsedObject || parsed.type || eventName || 'unknown';
            warnOnce(String(unknownKey), `AgentScope SSE 未处理的事件类型: ${String(unknownKey)}`);
          },
          flush: (controller) => {
            startedReasoningIds.forEach((id) => {
              controller.enqueue({ type: 'reasoning-end', id });
            });
            startedTextIds.forEach((id) => {
              controller.enqueue({ type: 'text-end', id });
            });
            controller.enqueue({
              type: 'finish',
              finishReason,
              usage,
            });
          },
        }),
      );

    return {
      stream,
      request: { body },
      response: { headers: extractResponseHeaders(response) },
    };
  }
}
