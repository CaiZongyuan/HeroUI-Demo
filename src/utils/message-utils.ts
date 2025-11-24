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

/**
 * Extract plugin outputs from message parts
 * Returns array of tool results for custom UI rendering
 */
export interface PluginOutput {
    toolName: string;
    toolCallId: string;
    result: unknown;
}

export const extractPluginOutputs = (message: UIMessage): PluginOutput[] => {
    if (!message.parts) {
        console.log('[extractPluginOutputs] 没有 parts，返回空数组');
        return [];
    }

    const outputs: PluginOutput[] = [];

    message.parts.forEach((part: any, index: number) => {
        // AI SDK 的工具调用格式：
        // type: "tool-{toolName}" (例如 "tool-tool_now")
        // state: "output-available" (成功) 或 "output-error" (失败)
        // output: 工具输出数据

        // 检查是否是工具类型的 part
        if (part.type?.startsWith('tool-') && part.state === 'output-available') {
            // 从 type 中提取工具名称: "tool-tool_now" -> "tool_now"
            const toolName = part.type.substring(5); // 去掉 "tool-" 前缀

            // console.log(`[extractPluginOutputs] ✅ 找到工具输出:`, {
            //     toolName: toolName,
            //     toolCallId: part.toolCallId,
            //     output: part.output,
            // });

            outputs.push({
                toolName: toolName,
                toolCallId: part.toolCallId || 'unknown',
                result: part.output, // AI SDK 使用 output 字段，不是 result
            });
        }

        // 兼容标准的 tool-result 格式（如果后端改了）
        if (part.type === 'tool-result') {
            // console.log(`[extractPluginOutputs] ✅ 找到 tool-result:`, {
            //     toolName: part.toolName,
            //     toolCallId: part.toolCallId,
            //     result: part.result,
            // });
            outputs.push({
                toolName: part.toolName || 'unknown',
                toolCallId: part.toolCallId || 'unknown',
                result: part.result,
            });
        }
    });

    // console.log('[extractPluginOutputs] 提取结果:', outputs);
    return outputs;
};
