const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://placeholder.supabase.co") return null;
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  documents: {
    list: () => apiRequest("/documents"),
    get: (id: string) => apiRequest(`/documents/${id}`),
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    process: (id: string) => apiRequest(`/documents/${id}/process`, { method: "POST" }),
    delete: (id: string) => apiRequest(`/documents/${id}`, { method: "DELETE" }),
  },
  analysis: {
    run: (documentId: string, role: string, stance: string) =>
      apiRequest(`/documents/${documentId}/analyze`, {
        method: "POST",
        body: JSON.stringify({ role, negotiation_stance: stance }),
      }),
    getRisks: (documentId: string) => apiRequest(`/documents/${documentId}/risks`),
    getObligations: (documentId: string) => apiRequest(`/documents/${documentId}/obligations`),
    getDeadlines: (documentId: string) => apiRequest(`/documents/${documentId}/deadlines`),
  },
  chat: {
    ask: (documentId: string, question: string) =>
      apiRequest(`/documents/${documentId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question }),
      }),
  },
  comparisons: {
    create: (documentAId: string, documentBId: string) =>
      apiRequest("/comparisons", {
        method: "POST",
        body: JSON.stringify({ document_a_id: documentAId, document_b_id: documentBId }),
      }),
    get: (id: string) => apiRequest(`/comparisons/${id}`),
  },
  consultation: {
    generate: (documentId: string) =>
      apiRequest(`/documents/${documentId}/consultation-sheet`, { method: "POST" }),
    get: (documentId: string) =>
      apiRequest(`/documents/${documentId}/consultation-sheet`),
  },
};
