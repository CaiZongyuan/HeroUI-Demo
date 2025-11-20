import { UIMessage } from 'ai';

export const extractCurrentActivity = (message: UIMessage): string => {
    if (!message.parts) return 'Thinking...';

    const lastPart = message.parts[message.parts.length - 1];
    if (lastPart.type === 'reasoning') {
        return 'Thinking...';
    } else if (lastPart.type === 'tool-invocation') {
        return `Using tool: ${lastPart.toolCallId}...`;
    }

    return 'Thinking...';
};

export const hasThinkingLogs = (message: UIMessage): boolean => {
    return message.parts?.some(part => part.type === 'reasoning' || part.type === 'tool-invocation') ?? false;
};

export const calculateThinkingTime = (createdAt?: Date): string => {
    if (!createdAt) return '0s';
    const diff = new Date().getTime() - new Date(createdAt).getTime();
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s`;
};

export interface GroupedLog {
    type: 'reasoning' | 'tool';
    title: string;
    content: string | any;
    expanded: boolean;
}

export const groupThinkingLogs = (message: UIMessage): GroupedLog[] => {
    if (!message.parts) return [];

    const logs: GroupedLog[] = [];

    message.parts.forEach((part: any) => {
        if (part.type === 'reasoning') {
            logs.push({
                type: 'reasoning',
                title: 'Reasoning',
                content: part.text,
                expanded: true,
            });
        } else if (part.type === 'tool-invocation') {
            // Handle both nested toolInvocation and flattened structure
            const toolName = part.toolInvocation?.toolName || part.toolName || 'Unknown Tool';
            const toolCallId = part.toolInvocation?.toolCallId || part.toolCallId;
            const invocation = part.toolInvocation || part;

            logs.push({
                type: 'tool',
                title: `Used tool: ${toolName}`,
                content: formatToolCallForDisplay(invocation),
                expanded: true,
            });
        }
    });

    return logs;
};

export const formatToolCallForDisplay = (toolInvocation: any) => {
    return {
        args: toolInvocation.args || {},
        result: toolInvocation.result || 'No result',
    };
};

export const extractActiveThinkingInfo = (message: UIMessage) => {
    if (!message.parts || message.parts.length === 0) return null;

    const lastPart = message.parts[message.parts.length - 1] as any;

    if (lastPart.type === 'reasoning') {
        return {
            type: 'reasoning' as const,
            title: 'Thinking Process',
            content: lastPart.text,
        };
    } else if (lastPart.type === 'tool-invocation') {
        const toolName = lastPart.toolInvocation?.toolName || lastPart.toolName || 'Unknown Tool';
        return {
            type: 'tool' as const,
            title: `Using Tool: ${toolName}`,
            content: 'Processing...', // Tool invocations might not have streaming text content in the same way, or we could show args
        };
    }

    return null;
};
