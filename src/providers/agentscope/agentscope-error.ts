import { APICallError, InvalidResponseDataError } from '@ai-sdk/provider';

type ErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export async function buildAgentScopeAPIError(params: {
  response: Response;
  url: string;
  requestBodyValues: unknown;
}): Promise<APICallError> {
  const { response, url, requestBodyValues } = params;

  let responseBody: string | undefined;
  let message = `AgentScope 请求失败，HTTP ${response.status}`;
  try {
    responseBody = await response.text();
    const parsed: ErrorResponse = JSON.parse(responseBody);
    if (parsed?.error?.message) {
      message = parsed.error.message;
    }
  } catch {
    // 忽略解析失败，保留默认提示
  }

  return new APICallError({
    message,
    url,
    requestBodyValues,
    statusCode: response.status,
    responseBody,
    responseHeaders: Object.fromEntries(response.headers.entries()),
    isRetryable: response.status >= 500,
  });
}

export function assertObject(value: unknown, context: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw new InvalidResponseDataError({
      message: `${context} 不是有效的对象`,
      data: value,
    });
  }
}
