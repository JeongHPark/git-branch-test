declare module 'sync-request-curl' {
  export interface Options {
    headers?: Record<string, string>;
    qs?: Record<string, unknown>;
    body?: unknown;
    json?: boolean;
    timeout?: number;
    followRedirects?: boolean;
    maxRedirects?: number;
  }

  export interface Response {
    statusCode: number;
    headers: Record<string, string>;
    body: Buffer | string;
    url: string;
    getBody(encoding?: string): string;
  }

  function request(
    method: string,
    url: string,
    options?: Options
  ): Response;

  export = request;
}
