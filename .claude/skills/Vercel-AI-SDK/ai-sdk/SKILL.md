---
name: ai-sdk
description: This skill should be used when users need to work with the Vercel AI SDK for building AI-powered applications. It provides comprehensive guidance on core APIs (generateText, streamText, generateObject), tool calling, embeddings, structured data generation, error handling, middleware, provider management, testing, telemetry, and advanced AI SDK features.
---

# AI SDK

## Core Functionality

The Vercel AI SDK provides a powerful, type-safe framework for building AI-powered applications with JavaScript and TypeScript. It abstracts away the complexity of working with different AI providers, enabling developers to focus on building features rather than managing API integrations. The SDK supports text generation, structured data generation, tool calling, embeddings, streaming, and advanced patterns like middleware and RAG implementations.

## When to Use

This skill should be used when you need to:
- Generate text or structured data from Large Language Models
- Implement tool calling and multi-step workflows
- Work with embeddings for similarity calculations or RAG applications
- Set up middleware for logging, caching, or guardrails
- Configure multiple AI providers and models
- Handle errors and streaming scenarios effectively
- Test AI applications without making actual API calls
- Implement telemetry and monitoring for AI operations

## Module Overview

### Core Module
- **Functionality**: Core text generation and error handling functionality including generateText, streamText, and comprehensive error management patterns
- **Key APIs**: generateText, streamText, smoothStream, textStream, fullStream, onError, onFinish, onChunk, experimental_transform
- **Detailed documentation**: `references/generating-text.md`, `references/error-handling.md`

### Structured Data Module
- **Functionality**: Structured data generation and prompt engineering for type-safe AI-generated objects and arrays
- **Key APIs**: generateObject, streamObject, experimental_output, repairText, partialObjectStream, elementStream
- **Detailed documentation**: `references/generating-structured-data.md`, `references/prompt-engineering.md`

### Tools Module
- **Functionality**: Tool calling and Model Context Protocol integration for interactive AI workflows
- **Key APIs**: tool, execute, inputSchema, stopWhen, onStepFinish, maxSteps, experimental_createMCPClient
- **Detailed documentation**: `references/tool-calling.md`, `references/mcp-tools.md`

### Embeddings Module
- **Functionality**: Embedding functionality and similarity calculations for vector-based AI applications
- **Key APIs**: embed, embedMany, cosineSimilarity, openai.textEmbeddingModel, mistral.textEmbeddingModel
- **Detailed documentation**: `references/embeddings.md`

### Middleware Module
- **Functionality**: Middleware patterns and provider management for advanced AI SDK customization
- **Key APIs**: wrapLanguageModel, customProvider, createProviderRegistry, defaultSettingsMiddleware, extractReasoningMiddleware
- **Detailed documentation**: `references/language-model-middleware.md`, `references/provider-and-model-management.md`

### Advanced Module
- **Functionality**: Advanced features like telemetry, testing, and configuration for production-ready AI applications
- **Key APIs**: experimental_telemetry, MockLanguageModelV2, MockEmbeddingModelV2, simulateReadableStream, globalThis.AI_SDK_DEFAULT_PROVIDER
- **Detailed documentation**: `references/telemetry.md`, `references/testing.md`, `references/settings.md`

## Workflow

### Getting Started with Text Generation
1. **Install required packages**: Begin by installing the AI SDK core package and provider-specific packages (`npm install ai @ai-sdk/openai`)
2. **Configure provider**: Set up your preferred AI provider with API keys and model selection
3. **Use generateText for basic text generation**: Implement simple text generation using `generateText` with appropriate prompts and parameters
4. **Implement streaming with streamText**: Use `streamText` for real-time text generation with better user experience
5. **Add error handling**: Implement comprehensive error handling using try/catch blocks and the `onError` callback
6. **Handle streaming errors specifically**: Use `onAbort` and `onFinish` callbacks for complete stream lifecycle management
7. **Reference detailed documentation**: Consult `references/generating-text.md` for advanced features and `references/error-handling.md` for error patterns

### Working with Structured Data
1. **Define Zod schemas**: Create type-safe schemas using Zod for your structured data requirements
2. **Use generateObject for single objects**: Generate complete JSON objects with schema validation
3. **Implement streamObject for partial results**: Stream structured data as it's generated for real-time updates
4. **Handle errors with NoObjectGeneratedError**: Catch and handle cases where object generation fails
5. **Use experimental_output with generateText**: Enable structured output with regular text generation when needed
6. **Reference detailed documentation**: Consult `references/generating-structured-data.md` for advanced patterns and `references/prompt-engineering.md` for schema design best practices

### Implementing Tool Calling
1. **Define tools with schemas**: Create tools using the `tool` function with clear descriptions and Zod input schemas
2. **Implement execute functions**: Write async execute functions that perform the actual tool operations
3. **Set up multi-step workflows**: Use `maxSteps` and `stopWhen` to control workflow progression
4. **Add lifecycle hooks**: Use `onStepFinish` for logging and monitoring tool execution
5. **Handle tool errors gracefully**: Implement error handling within tools and for tool execution failures
6. **Reference detailed documentation**: Consult `references/tool-calling.md` for comprehensive tool calling patterns and `references/mcp-tools.md` for MCP integration

### Using Embeddings and Similarity
1. **Configure embedding models**: Set up text embedding models from providers like OpenAI or Mistral
2. **Use embed for single values**: Embed individual text values for processing
3. **Use embedMany for batch processing**: Process multiple text values efficiently in parallel
4. **Calculate similarity with cosineSimilarity**: Compare embeddings for semantic similarity
5. **Track token usage**: Monitor embedding costs and usage statistics
6. **Reference detailed documentation**: Consult `references/embeddings.md` for embedding configuration and best practices

### Setting Up Middleware
1. **Create middleware with wrapLanguageModel**: Implement custom middleware to intercept and modify model calls
2. **Use built-in middleware**: Leverage built-in middleware for common patterns like reasoning extraction and default settings
3. **Chain multiple middleware**: Combine multiple middleware functions for complex behavior
4. **Implement custom patterns**: Create middleware for caching, logging, RAG, or guardrails
5. **Configure per-request metadata**: Pass custom metadata through middleware for advanced scenarios
6. **Reference detailed documentation**: Consult `references/language-model-middleware.md` for middleware implementation and `references/provider-and-model-management.md` for provider configuration

### Provider Management and Configuration
1. **Create custom providers**: Use `customProvider` to pre-configure model settings and aliases
2. **Set up provider registry**: Implement centralized model management with `createProviderRegistry`
3. **Configure global defaults**: Use `globalThis.AI_SDK_DEFAULT_PROVIDER` for application-wide settings
4. **Handle multiple providers**: Manage different AI providers with unified interfaces
5. **Apply consistent settings**: Use middleware to apply default settings across models
6. **Reference detailed documentation**: Consult `references/provider-and-model-management.md` for advanced provider patterns and `references/settings.md` for configuration options

### Testing and Telemetry
1. **Use mock providers for testing**: Implement deterministic unit tests with `MockLanguageModelV2` and `MockEmbeddingModelV2`
2. **Simulate streams in tests**: Use `simulateReadableStream` for testing streaming scenarios
3. **Set up OpenTelemetry**: Configure telemetry for monitoring AI SDK operations
4. **Track custom metadata**: Add custom function IDs and metadata for better observability
5. **Control data collection**: Use `recordInputs` and `recordOutputs` for privacy and cost management
6. **Reference detailed documentation**: Consult `references/testing.md` for comprehensive test patterns and `references/telemetry.md` for monitoring setup

## Resource References

- **For detailed API specifications**: `references/generating-text.md` - Comprehensive guide to generateText and streamText functions, their features, callbacks, and integration patterns
- **For code examples and templates**: `references/tool-calling.md` - Extensive examples of tool calling patterns, multi-step workflows, and advanced features
- **For complex workflows**: `references/language-model-middleware.md` - Advanced middleware implementation examples for logging, caching, RAG, and guardrails
- **For structured data patterns**: `references/generating-structured-data.md` - Complete guide to generateObject, streamObject, and type-safe structured data generation
- **For embedding and similarity**: `references/embeddings.md` - Embedding functionality, batch processing, and similarity calculations
- **For error handling strategies**: `references/error-handling.md` - Comprehensive error handling patterns for regular and streaming operations
- **For testing strategies**: `references/testing.md` - Mock providers and test helpers for deterministic unit testing
- **For monitoring and observability**: `references/telemetry.md` - OpenTelemetry integration and custom telemetry setup
- **For configuration and settings**: `references/settings.md` - All available settings parameters and their usage
- **For prompt engineering best practices**: `references/prompt-engineering.md` - Schema design, debugging techniques, and compatibility considerations
- **For MCP integration**: `references/mcp-tools.md` - Model Context Protocol tools integration and resource management
- **For provider management**: `references/provider-and-model-management.md` - Custom providers, provider registry, and global configuration