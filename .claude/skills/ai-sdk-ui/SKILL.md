---
name: ai-sdk-ui
description: This skill should be used when users need to build AI-powered user interfaces using the Vercel AI SDK UI. It provides comprehensive guidance on React hooks (useChat, useCompletion, useObject), streaming protocols, chat interfaces, tool calling, message persistence, error handling, and advanced patterns like resumable streams and custom data streaming.
---

# AI SDK UI

## Core Functionality

Build sophisticated AI-powered user interfaces using the Vercel AI SDK UI with comprehensive React hooks, streaming protocols, and type-safe patterns. Create real-time chat interfaces, streaming text completions, structured object generation, and complex tool-driven applications with built-in error handling and state management.

## When to Use

Use this skill when building applications that require:
- Conversational AI interfaces with real-time message streaming
- Streaming text generation with user input handling
- Structured data generation with type-safe schemas
- Tool calling and function execution workflows
- Custom data streaming alongside AI responses
- Message persistence and chat history management
- Resumable streams for long-running generations
- Error handling and recovery patterns

## Module Overview

### Core Module
- **Functionality**: Essential React hooks for AI interfaces including conversational chat, streaming text completion, and structured object generation
- **Key APIs**: `useChat`, `useCompletion`, `useObject`, `streamText`, `streamObject`
- **Detailed documentation**: `references/Chatbot.md`, `references/Completion.md`, `references/Object-Generation.md`

### Streaming Module
- **Functionality**: Advanced streaming patterns, custom data streaming, resumable streams, and stream protocol handling
- **Key APIs**: `readUIMessageStream`, `toUIMessageStreamResponse`, `toTextStreamResponse`, `createUIMessageStream`
- **Detailed documentation**: `references/Streaming-Custom-Data.md`, `references/Stream-Protocols.md`, `references/Reading-UI-Message-Streams.md`, `references/Chatbot-Resume-Streams.md`

### Tools Module
- **Functionality**: Tool calling, function execution, server-side and client-side tool integration with multi-step workflows
- **Key APIs**: `onToolCall`, `addToolOutput`, `sendAutomaticallyWhen`, `stepCountIs`
- **Detailed documentation**: `references/Chatbot-Tool-Usage.md`

### Persistence Module
- **Functionality**: Message storage, chat history management, validation, and metadata handling for long-term conversation persistence
- **Key APIs**: `validateUIMessages`, `generateId`, `createIdGenerator`, `messageMetadata`
- **Detailed documentation**: `references/Chatbot-Message-Persistence.md`, `references/Message-Metadata.md`

### Error Handling Module
- **Functionality**: Error handling patterns, warning management, recovery strategies, and testing techniques for robust applications
- **Key APIs**: `globalThis.AI_SDK_LOG_WARNINGS`, `onError`, `error object`, `regenerate`
- **Detailed documentation**: `references/Error-Handling.md`

### Transport Module
- **Functionality**: Custom transport configuration, request handling, authentication patterns, and protocol customization
- **Key APIs**: `DefaultChatTransport`, `ChatTransport`, `prepareSendMessagesRequest`
- **Detailed documentation**: `references/Transport.md`

## Workflow

### 1. Basic Chat Interface Setup
Choose the appropriate core hook based on your interface requirements:
- Use `useChat` for conversational interfaces with message history
- Use `useCompletion` for streaming text generation without conversation context
- Use `useObject` for structured data generation with type safety

Set up your API route with `streamText` or `streamObject` and configure the client-side hook with proper error handling and loading states.

### 2. Implement Tool Integration
Configure tool calling when your application needs to:
- Execute server-side functions or APIs
- Interact with external services
- Perform multi-step operations
- Handle user input validation

Define tools with proper schemas, implement `onToolCall` callbacks for client-side execution, or configure automatic server-side execution with `execute` functions.

### 3. Add Streaming and Persistence
Implement advanced streaming patterns for real-time updates, custom data alongside AI responses, or resumable streams for long-running operations. Set up message persistence when chat history and conversation continuity are required.

### 4. Configure Transport and Error Handling
Customize transport layer for specific authentication requirements, API patterns, or alternative protocols. Implement comprehensive error handling with recovery patterns and user feedback mechanisms.

### 5. Type Safety and Validation
Ensure type safety throughout your application using TypeScript interfaces, Zod schemas for validation, and proper type inference for tools and message structures.

## Common Usage Patterns

### Chatbot with Tool Calling
```typescript
// Server-side: API route with tools
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4'),
    messages,
    tools: {
      getWeather: {
        description: 'Get weather information',
        parameters: z.object({
          location: z.string(),
        }),
        execute: async ({ location }) => {
          // Weather API call
          return { temperature: 22, condition: 'sunny' };
        }
      }
    }
  });

  return result.toUIMessageStreamResponse();
}
```

### Object Generation with Type Safety
```typescript
// Define schema with Zod
const notificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'warning', 'error']),
});

// Client-side component
function NotificationGenerator() {
  const { object, submit, isLoading } = useObject({
    api: '/api/generate-notification',
    schema: notificationSchema,
  });

  return (
    <div>
      <button onClick={() => submit({})} disabled={isLoading}>
        Generate Notification
      </button>
      {object && (
        <div className={`notification ${object.type}`}>
          <h3>{object.title}</h3>
          <p>{object.message}</p>
        </div>
      )}
    </div>
  );
}
```

### Message Persistence Implementation
```typescript
// Server-side validation and storage
export async function POST(req: Request) {
  const { messages } = await req.json();

  // Validate messages against tools and schemas
  const validatedMessages = validateUIMessages(messages, {
    tools: definedTools,
    maxMessages: 100,
  });

  const result = streamText({
    model: openai('gpt-4'),
    messages: convertToModelMessages(validatedMessages),
    onFinish: async ({ response }) => {
      // Save complete conversation to storage
      await saveChat(chatId, [...validatedMessages, ...response.messages]);
    }
  });

  return result.toUIMessageStreamResponse();
}
```

## Resource References

### Detailed API Specifications
- **Core Hooks**: `references/Chatbot.md`, `references/Completion.md`, `references/Object-Generation.md`
- **Streaming Protocols**: `references/Stream-Protocols.md`, `references/Reading-UI-Message-Streams.md`
- **Custom Data Streaming**: `references/Streaming-Custom-Data.md`, `references/Chatbot-Resume-Streams.md`

### Implementation Examples
- **Tool Integration**: `references/Chatbot-Tool-Usage.md`
- **Message Persistence**: `references/Chatbot-Message-Persistence.md`
- **Error Handling**: `references/Error-Handling.md`

### Advanced Configuration
- **Transport Configuration**: `references/Transport.md`
- **Message Metadata**: `references/Message-Metadata.md`

## Routing Logic

The skill automatically routes to the appropriate module based on your queries:

- **Core hooks** (`useChat`, `useCompletion`, `useObject`) → Core Module
- **Streaming** (`stream`, `resumable`, `custom data`) → Streaming Module
- **Tool calling** (`tool`, `function`, `execute`) → Tools Module
- **Persistence** (`store`, `save`, `history`) → Persistence Module
- **Error handling** (`error`, `retry`, `recovery`) → Error Handling Module
- **Transport** (`headers`, `auth`, `config`) → Transport Module

## Best Practices

1. **Type Safety**: Always use TypeScript interfaces and Zod schemas for validation
2. **Error Recovery**: Implement comprehensive error handling with user-friendly messages
3. **Performance**: Use message validation and optimized sending for large conversations
4. **User Experience**: Provide loading states, error feedback, and recovery options
5. **Security**: Validate all inputs and sanitize tool parameters