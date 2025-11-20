export type MessagePartType = 'text' | 'reasoning' | 'tool-invocation';

export interface MessagePartRule {
  type: MessagePartType;
  shouldRender: (part: any) => boolean;
  render: (part: any) => React.ReactNode; // This will be handled in the component
}

export const MESSAGE_PART_RULES = {
  text: {
    shouldRender: (part: any) => part.type === 'text',
  },
  reasoning: {
    shouldRender: (part: any) => part.type === 'reasoning',
  },
  toolInvocation: {
    shouldRender: (part: any) => part.type === 'tool-invocation',
  },
};
