import { InvalidArgumentError, type LanguageModelV2Prompt } from '@ai-sdk/provider';
import { convertUint8ArrayToBase64 } from '@ai-sdk/provider-utils';

export type AgentScopeContent =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'image';
      image_url: string;
    }
  | {
      type: 'file';
      file_data: string;
      filename?: string;
    };

export interface AgentScopeMessagePayload {
  object?: 'message';
  type: 'message';
  role?: string;
  content: AgentScopeContent[];
}

function toTextContent(text: string): AgentScopeContent {
  return { type: 'text', text };
}

function toFileContent(data: string | URL | Uint8Array): AgentScopeContent {
  if (data instanceof Uint8Array) {
    return { type: 'file', file_data: convertUint8ArrayToBase64(data) };
  }

  const url = typeof data === 'string' ? data : String(data);
  return { type: 'image', image_url: url };
}

export function convertToAgentScopeMessages(prompt: LanguageModelV2Prompt): AgentScopeMessagePayload[] {
  return prompt.map((message) => {
    switch (message.role) {
      case 'system': {
        return {
          object: 'message',
          type: 'message',
          role: 'system',
          content: [toTextContent(message.content)],
        };
      }
      case 'user': {
        const userMessage = message as Extract<
          LanguageModelV2Prompt[number],
          { role: 'user' }
        >;
        const content = userMessage.content.map((part) => {
          switch (part.type) {
            case 'text':
              return toTextContent(part.text);
            case 'file':
              return toFileContent(part.data);
            default:
              throw new InvalidArgumentError({
                argument: 'prompt',
                message: 'Unsupported user content part type',
              });
          }
        });

        return {
          object: 'message',
          type: 'message',
          role: 'user',
          content,
        };
      }
      case 'assistant': {
        const assistantMessage = message as Extract<
          LanguageModelV2Prompt[number],
          { role: 'assistant' }
        >;
        const content = assistantMessage.content.map((part) => {
          switch (part.type) {
            case 'text':
              return toTextContent(part.text);
            default:
              throw new InvalidArgumentError({
                argument: 'prompt',
                message: 'Unsupported assistant content part type',
              });
          }
        });

        return {
          object: 'message',
          type: 'message',
          role: 'assistant',
          content,
        };
      }
      default:
        throw new InvalidArgumentError({
          argument: 'prompt',
          message: `Unsupported message role: ${message.role}`,
        });
    }
  });
}
