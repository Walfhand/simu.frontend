import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export interface ApiError {
  type: string;
  title: string;
  status: number;
  traceId: string;
  detail: string;
}
type HandlerWithParams<TParams> = (
  request: NextRequest,
  context: { params: Promise<TParams> }
) => Promise<NextResponse>;

export async function withGlobalMiddleware<TParams>(
  handlers: Record<string, HandlerWithParams<TParams>>
) {
  const wrappedHandlers: Record<string, HandlerWithParams<TParams>> = {};

  Object.keys(handlers).forEach((method) => {
    wrappedHandlers[method] = async (
      request: NextRequest,
      context: { params: Promise<TParams> }
    ) => {
      try {
        const response = await handlers[method](request, context);
        return response;
      } catch (error: any) {
        const apiError = error as AxiosError;
        return NextResponse.json(apiError.response?.data as ApiError, {
          status: apiError.status || 500,
        });
      }
    };
  });

  return wrappedHandlers;
}
