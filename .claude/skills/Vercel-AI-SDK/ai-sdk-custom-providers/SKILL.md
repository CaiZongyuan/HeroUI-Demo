---
name: ai-sdk-custom-providers
description: This skill should be used when users need to create custom AI providers or integrate OpenAI-compatible providers with the Vercel AI SDK. It provides comprehensive guidance on implementing the Language Model Specification V2, setting up providers from scratch, or leveraging existing OpenAI-compatible APIs for quick integration.
---

# AI SDK Custom Providers

## Core Functionality

This skill provides comprehensive guidance for creating custom AI providers and integrating OpenAI-compatible providers with the Vercel AI SDK. It supports two main approaches: building custom providers from scratch using the Language Model Specification V2, or quickly integrating existing OpenAI-compatible APIs through standardized interfaces.

## When to Use

Choose this skill when you need to:
- Create a custom AI provider that implements the Language Model Specification V2
- Integrate an existing OpenAI-compatible provider with the AI SDK
- Implement advanced features like streaming, tool calling, and multimodal content
- Set up provider authentication, configuration, and error handling
- Decide between custom implementation versus OpenAI-compatible integration

## Module Overview

### Custom Provider Module
- Functionality: Complete custom provider development from scratch using the Language Model Specification V2
- Key APIs: ProviderV2, LanguageModelV2, doGenerate, doStream, LanguageModelV2Content, LanguageModelV2Prompt
- Detailed documentation: `references/Writing-a-Custom-Provider.md`

### OpenAI-Compatible Provider Module
- Functionality: Quick integration with existing OpenAI-compatible providers
- Key APIs: createOpenAICompatible, generateText, MetadataExtractor, chatModel
- Detailed documentation: `references/OpenAI-Compatible-Providers.md`

## Workflow

### 1. Choose Your Implementation Approach

**For Custom Providers (Advanced)**:
- Use when you need full control over provider implementation
- Required for non-OpenAI-compatible APIs
- Implement when you need custom authentication or error handling
- Reference: `references/Writing-a-Custom-Provider.md` for complete implementation guide

**For OpenAI-Compatible Providers (Quick Setup)**:
- Use when integrating existing OpenAI-compatible APIs
- Ideal for rapid development and prototyping
- Supports standard OpenAI API features
- Reference: `references/OpenAI-Compatible-Providers.md` for setup instructions

### 2. Implementation Steps

**Custom Provider Implementation**:
1. Create the provider entry point implementing ProviderV2
2. Implement LanguageModelV2 with doGenerate and doStream methods
3. Handle message conversion between AI SDK and provider formats
4. Implement streaming with proper error handling
5. Add support for tools, file generation, and usage tracking

**OpenAI-Compatible Integration**:
1. Install the @ai-sdk/openai-compatible package
2. Configure provider with API endpoints and authentication
3. Set up model instances with proper typing
4. Implement custom metadata extraction if needed
5. Configure provider-specific options and headers

### 3. Common Patterns and Best Practices

**Error Handling**:
- Always wrap API calls in try-catch blocks
- Implement proper error transformation to AI SDK format
- Use retry logic for transient failures
- Reference detailed error patterns in `references/Writing-a-Custom-Provider.md`

**Streaming Implementation**:
- Implement TransformStream for response processing
- Handle partial responses and chunk boundaries
- Provide proper usage tracking during streaming
- See streaming examples in both reference documents

**Tool Calling**:
- Implement function tools with proper schema validation
- Handle provider-defined client tools when supported
- Process tool results and continue conversations
- Reference tool calling patterns in custom provider documentation

**Authentication and Security**:
- Store API keys securely using environment variables
- Implement proper header and query parameter handling
- Use TLS/HTTPS for all API communications
- Configure rate limiting and retry policies

## Resource References

- For detailed custom provider implementation: `references/Writing-a-Custom-Provider.md`
- For OpenAI-compatible provider setup: `references/OpenAI-Compatible-Providers.md`
- For advanced features like streaming and tool calling: Both reference documents provide comprehensive examples
- For provider architecture understanding: Review the Language Model Specification V2 sections in the custom provider documentation

## Decision Guidance

Choose **custom provider implementation** when:
- Your provider doesn't follow OpenAI API format
- You need custom authentication or request/response handling
- You require provider-specific features not supported by OpenAI format
- You need fine-grained control over streaming and error handling

Choose **OpenAI-compatible integration** when:
- Your provider follows OpenAI API specification
- You need rapid integration with minimal code
- Standard OpenAI features meet your requirements
- You prefer TypeScript auto-completion for model IDs