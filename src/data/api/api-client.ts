import { ApiError, type ApiResponse } from "./api.types";

export interface ApiClientConfig {
  baseUrl: string;
  authToken?: string;
  onAuthFailure?: () => void;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

export class ApiClient {
  private config: ApiClientConfig;
  private abortControllers = new Set<AbortController>();

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 15000,
      retryCount: 2,
      retryDelay: 500,
      ...config,
    };
  }

  setAuthToken(token: string) {
    this.config.authToken = token;
  }

  clearAuthToken() {
    this.config.authToken = undefined;
  }

  cancelAllRequests() {
    for (const ctrl of this.abortControllers) {
      ctrl.abort();
    }
    this.abortControllers.clear();
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }
    const res = await this.request("GET", url.toString());
    return res.data as T;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.request("POST", `${this.config.baseUrl}${path}`, body);
    return res.data as T;
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.request("PUT", `${this.config.baseUrl}${path}`, body);
    return res.data as T;
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.request("PATCH", `${this.config.baseUrl}${path}`, body);
    return res.data as T;
  }

  async delete<T>(path: string): Promise<T> {
    const res = await this.request("DELETE", `${this.config.baseUrl}${path}`);
    return res.data as T;
  }

  /**
   * POST that returns the raw streaming Response (no JSON parsing, no retry).
   * For Server-Sent Events endpoints like the workspace assistant chat. The
   * caller reads `response.body` and handles the SSE frames itself.
   */
  async stream(path: string, body?: unknown, signal?: AbortSignal): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      // Skip ngrok-free's HTML interstitial (it strips CORS headers); no-op elsewhere.
      "ngrok-skip-browser-warning": "true",
    };
    if (this.config.authToken) {
      headers["Authorization"] = `Bearer ${this.config.authToken}`;
    }

    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    if (res.status === 401 && this.config.onAuthFailure) {
      this.config.onAuthFailure();
    }
    if (!res.ok || !res.body) {
      throw new ApiError(`Stream request failed (${res.status})`, res.status, "STREAM");
    }
    return res;
  }

  private async request(
    method: string,
    url: string,
    body?: unknown,
    attempt = 0,
  ): Promise<ApiResponse<unknown>> {
    const ctrl = new AbortController();
    this.abortControllers.add(ctrl);

    const timeoutId = setTimeout(() => ctrl.abort(), this.config.timeout);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        // Skip ngrok-free's HTML interstitial (it strips CORS headers); no-op elsewhere.
        "ngrok-skip-browser-warning": "true",
      };
      if (this.config.authToken) {
        headers["Authorization"] = `Bearer ${this.config.authToken}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });

      clearTimeout(timeoutId);
      this.abortControllers.delete(ctrl);

      const json: ApiResponse<unknown> = await res.json();

      if (!res.ok || !json.success) {
        const err = json.error ?? { code: "UNKNOWN", message: "Request failed" };
        if (res.status === 401 && this.config.onAuthFailure) {
          this.config.onAuthFailure();
        }
        throw new ApiError(err.message, res.status, err.code, err.details);
      }

      return json;
    } catch (err) {
      clearTimeout(timeoutId);
      this.abortControllers.delete(ctrl);

      if (err instanceof ApiError) throw err;

      if (attempt < (this.config.retryCount ?? 0)) {
        await new Promise((r) => setTimeout(r, this.config.retryDelay));
        return this.request(method, url, body, attempt + 1);
      }

      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiError("Request timed out", 408, "TIMEOUT");
      }

      throw new ApiError(
        err instanceof Error ? err.message : "Network error",
        0,
        "NETWORK",
      );
    }
  }
}
