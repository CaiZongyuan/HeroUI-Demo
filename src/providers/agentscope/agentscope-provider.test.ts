// @ts-nocheck
import { describe, expect, it } from 'bun:test';

import { AgentScopeChatLanguageModel } from './agentscope-chat-language-model';
import { convertToAgentScopeMessages } from './convert-to-agentscope-messages';

async function readAllStreamParts(stream: ReadableStream<any>) {
  const reader = stream.getReader();
  const parts: unknown[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    parts.push(value);
  }
  return parts;
}

describe('convertToAgentScopeMessages', () => {
  it('converts system/user messages', () => {
    const prompt = [
      { role: 'system', content: 'hi' as const },
      { role: 'user', content: [{ type: 'text' as const, text: 'hello' }] },
    ];

    const messages = convertToAgentScopeMessages(prompt);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({
      object: 'message',
      role: 'system',
      type: 'message',
      content: [{ type: 'text', text: 'hi' }],
    });
    expect(messages[1].content[0]).toEqual({ type: 'text', text: 'hello' });
  });

  it('maps file part to image content', () => {
    const prompt = [
      {
        role: 'user' as const,
        content: [{ type: 'file' as const, data: new URL('http://localhost/img.png'), mimeType: 'image/png' }],
      },
    ];

    const messages = convertToAgentScopeMessages(prompt);
    expect(messages[0].content[0]).toEqual({
      type: 'image',
      image_url: 'http://localhost/img.png',
    });
  });

  it('ignores unsupported assistant parts but keeps reasoning as text', () => {
    const prompt = [
      {
        role: 'assistant' as const,
        content: [
          { type: 'reasoning' as const, text: 'thinking...' },
          { type: 'tool-result' as const, toolName: 'demo', result: { ok: true } },
          { type: 'text' as const, text: 'final answer' },
        ],
      },
    ];

    const messages = convertToAgentScopeMessages(prompt);
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toEqual([
      { type: 'text', text: 'thinking...' },
      { type: 'text', text: 'final answer' },
    ]);
  });
});

describe('AgentScopeChatLanguageModel', () => {
  const prompt = [{ role: 'user' as const, content: [{ type: 'text' as const, text: 'ping' }] }];

  it('parses non-streaming response', async () => {
    let receivedBody: unknown;
    const mockFetch: typeof fetch = async (_url, init) => {
      receivedBody = init?.body ? JSON.parse(init.body as string) : undefined;
      const payload = {
        status: 'completed',
        output: [
          {
            object: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'text', text: 'pong' }],
          },
        ],
        usage: { input_tokens: 3, output_tokens: 2, total_tokens: 5 },
      };
      return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const model = new AgentScopeChatLanguageModel('test-model', {
      baseURL: 'http://localhost:8000',
      streamPath: '/stream',
      processPath: '/process',
      userId: 'u1',
      fetch: mockFetch,
    });

    const result = await model.doGenerate({ prompt });
    expect((receivedBody as Record<string, unknown>)?.user_id).toBe('u1');
    expect(result.content[0]).toEqual({ type: 'text', text: 'pong' });
    expect(result.finishReason).toBe('stop');
    expect(result.usage.totalTokens).toBe(5);
  });

  it('parses SSE stream', async () => {
    const sseText = [
      'event: text',
      'data: {"object":"content","type":"text","status":"in_progress","delta":true,"text":"hello","msg_id":"msg_1"}',
      '',
      'event: message',
      'data: {"object":"message","id":"msg_1","status":"completed","content":[{"type":"text","text":"hello"}]}',
      '',
      'event: response',
      'data: {"id":"resp_1","object":"response","status":"completed","usage":{"input_tokens":1,"output_tokens":1,"total_tokens":2}}',
      '',
      '',
    ]
      .join('\n')
      .concat('\n');

    const sseStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseText));
        controller.close();
      },
    });

    const mockFetch: typeof fetch = async () =>
      new Response(sseStream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });

    const model = new AgentScopeChatLanguageModel('test-model', {
      baseURL: 'http://localhost:8000',
      streamPath: '/stream',
      processPath: '/process',
      userId: 'u1',
      fetch: mockFetch,
    });

    const { stream } = await model.doStream({ prompt });
    const parts = await readAllStreamParts(stream);

    const textDelta = parts.find((p: any) => p?.type === 'text-delta');
    const finish = parts.find((p: any) => p?.type === 'finish');
    expect(textDelta?.delta).toBe('hello');
    expect(finish?.finishReason).toBe('stop');
    expect(finish?.usage?.totalTokens).toBe(2);
  });

  it('keeps text ids stable when message and content ids differ', async () => {
    const sseText = [
      'event: message',
      'data: {"object":"message","id":"","status":"completed","content":[{"type":"text","text":"hello"}]}',
      '',
      'event: text',
      'data: {"object":"content","type":"text","status":"in_progress","delta":true,"text":" world","msg_id":"msg_2"}',
      '',
      'event: response',
      'data: {"id":"resp_1","object":"response","status":"completed"}',
      '',
      '',
    ]
      .join('\n')
      .concat('\n');

    const sseStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseText));
        controller.close();
      },
    });

    const mockFetch: typeof fetch = async () =>
      new Response(sseStream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });

    const model = new AgentScopeChatLanguageModel('test-model', {
      baseURL: 'http://localhost:8000',
      streamPath: '/stream',
      processPath: '/process',
      userId: 'u1',
      fetch: mockFetch,
    });

    const { stream } = await model.doStream({ prompt });
    const parts = await readAllStreamParts(stream);
    const textStarts = parts.filter((p: any) => p?.type === 'text-start');
    const textDeltas = parts.filter((p: any) => p?.type === 'text-delta');
    expect(textStarts).toHaveLength(1);
    expect(textDeltas.length).toBeGreaterThan(0);
    expect(textDeltas.every((delta: any) => delta.id === textStarts[0].id)).toBe(true);
  });

  it('emits reasoning chunks with reasoning parts', async () => {
    const sseText = [
      'event: text',
      'data: {"object":"reasoning","type":"text","status":"in_progress","delta":true,"text":"thinking","msg_id":"msg_r"}',
      '',
      'event: response',
      'data: {"id":"resp_2","object":"response","status":"completed"}',
      '',
      '',
    ]
      .join('\n')
      .concat('\n');

    const sseStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseText));
        controller.close();
      },
    });

    const mockFetch: typeof fetch = async () =>
      new Response(sseStream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });

    const model = new AgentScopeChatLanguageModel('test-model', {
      baseURL: 'http://localhost:8000',
      streamPath: '/stream',
      processPath: '/process',
      userId: 'u1',
      fetch: mockFetch,
    });

    const { stream } = await model.doStream({ prompt });
    const parts = await readAllStreamParts(stream);
    const reasoningStart = parts.find((p: any) => p?.type === 'reasoning-start');
    const reasoningDelta = parts.find((p: any) => p?.type === 'reasoning-delta');
    expect(reasoningStart?.id).toBeDefined();
    expect(reasoningDelta?.id).toBe(reasoningStart?.id);
    expect(reasoningDelta?.delta).toBe('thinking');
  });
});
