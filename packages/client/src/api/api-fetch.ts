import { ApiError } from "./api-error";

const DEFAULT_TIMEOUT = 10000;

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");

    let data: unknown = null;

    if (contentType?.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      data = { message: text };
    }

    if (!response.ok) {
      const message =
        typeof data === "object" && data !== null
          ? ((data as { message?: string; error?: string }).message ??
            (data as { message?: string; error?: string }).error ??
            `HTTP ${response.status}`)
          : `HTTP ${response.status}`;

      throw new ApiError(message, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timeout");
    }

    if (error instanceof TypeError) {
      throw new Error("Network error: server unreachable");
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}
