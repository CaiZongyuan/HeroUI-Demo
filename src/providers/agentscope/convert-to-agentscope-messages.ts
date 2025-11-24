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
        const content: AgentScopeContent[] = [];
        assistantMessage.content.forEach((part) => {
          switch (part.type) {
            case 'text': {
              content.push(toTextContent(part.text));
              break;
            }
            case 'reasoning': {
              // 前端推理片段落地为普通文本上下文，避免抛出错误
              if (typeof part.text === 'string') {
                content.push(toTextContent(part.text));
              }
              break;
            }
            default:
              // 忽略工具/未知片段，保持兼容性
              break;
          }
        });

        // 保底：如无可用内容，避免报错，写入空文本
        if (content.length === 0) {
          content.push(toTextContent(''));
        }

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
