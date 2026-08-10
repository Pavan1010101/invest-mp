/**
 * SISMP — Safe JSON Fetch Helper
 * Wraps the Fetch API to ensure `.json()` is never called on empty or non-JSON responses.
 * This prevents "Unexpected end of JSON input" SyntaxErrors when the server
 * returns error pages (500, 502, etc.) with empty or HTML bodies.
 */

export interface FetchJSONResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

export async function fetchJSON<T = any>(
  url: string,
  options?: RequestInit
): Promise<FetchJSONResult<T>> {
  try {
    const res = await fetch(url, options);

    // Check if the response has content before trying to parse JSON
    const contentType = res.headers.get('content-type') || '';
    const contentLength = res.headers.get('content-length');

    // Empty body guard: content-length is "0" or missing content-type
    if (contentLength === '0' || (!contentType.includes('application/json') && !res.ok)) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: `Server returned ${res.status} ${res.statusText || 'error'} (non-JSON response)`,
      };
    }

    // Try to parse JSON safely
    let json: any;
    try {
      const text = await res.text();
      if (!text || text.trim().length === 0) {
        return {
          ok: false,
          status: res.status,
          data: null,
          error: `Server returned ${res.status} with empty body`,
        };
      }
      json = JSON.parse(text);
    } catch {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: `Server returned ${res.status} with invalid JSON`,
      };
    }

    return {
      ok: res.ok,
      status: res.status,
      data: json as T,
      error: res.ok ? null : (json?.error || `Request failed with status ${res.status}`),
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err.message || 'Network error',
    };
  }
}
