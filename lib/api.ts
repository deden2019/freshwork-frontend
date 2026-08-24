// lib/api.ts

// Pastikan domain & port mengarah ke Laravel (biasanya 8000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  // Format endpoint agar tidak dobel slash
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Wajib gabungkan dengan API_URL eksternal Laravel
  const fullUrl = `${API_URL}${cleanEndpoint}`;

  return fetch(fullUrl, {
    ...options,
    headers,
  });
}

// TAMBAHKAN FUNGSI INI: Mencegah SyntaxError Unexpected Token '<'
export async function parseJsonResponse(res: Response) {
  const contentType = res.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }

  // Jika respon adalah HTML (Error 404, 500, atau Redirect Login)
  const text = await res.text();
  console.error(`[API Error ${res.status}] Respon bukan JSON:`, text);
  throw new Error(`Server mengembalikan respon HTML (${res.status}). Cek URL API atau Log Server.`);
}