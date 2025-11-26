import { agentscope } from '@/src/providers/agentscope';
import {
    convertToModelMessages,
    streamText,
    UIMessage
} from 'ai';

export async function POST(req: Request) {
    const { messages, userId, sessionId }: { messages: UIMessage[]; userId?: string; sessionId?: string } =
        await req.json();

    const result = streamText({
        model: agentscope('agentscope-runtime'),
        messages: convertToModelMessages(messages),
        providerOptions: {
            agentscope: {
                userId: userId ?? 'wk-ios',
                sessionId: sessionId ?? 'test01',
            },
        },
    });

    return result.toUIMessageStreamResponse({
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'none',
        },
    });
}