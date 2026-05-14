import { ApiClient } from "../api-client";

export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
  timeout: 15000,
  retryCount: 2,
  retryDelay: 500,
  onAuthFailure: () => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
});
