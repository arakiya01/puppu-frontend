// lib/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { supabase } from "@/lib/supabaseClient";

let redirectToLogin = () => {
  console.warn("redirectToLogin has not been set");
};

export function setRedirect(fn: () => void) {
  redirectToLogin = fn;
}

async function getAccessToken(): Promise<string> {
  const { data: sessionData, error } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (error || !token) {
    redirectToLogin();
    throw new Error("アクセストークンがありません");
  }
  return token;
}

async function baseFetch<T>(path: string, method: string, body?: unknown): Promise<T> {
  const accessToken = await getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "API Error");
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => baseFetch<T>(path, "GET", undefined),
  post: <T>(path: string, body: unknown) => baseFetch<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => baseFetch<T>(path, "PUT", body),
  delete: <T>(path: string) => baseFetch<T>(path, "DELETE", undefined),
  publicGet: async <T>(path: string) => {
    const res = await fetch(`${API_BASE_URL}${path}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "API Error");
    }
    return res.json();
  },
};
