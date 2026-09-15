"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Document, Analysis, RiskFinding, Obligation, Deadline, Comparison, ConsultationSheet, ChatResponse } from "@/types";
import {
  DEMO_DOCUMENTS,
  DEMO_RISK_FINDINGS,
  DEMO_OBLIGATIONS,
  DEMO_DEADLINES,
  DEMO_COMPARISON_CHANGES,
  DEMO_CONSULTATION_SHEET,
} from "@/lib/demo-data";
import { getDemoChatAnswer } from "@/lib/demo-answers";

const isConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url !== "https://placeholder.supabase.co";
};

// Demo-mode local store so uploads survive refetches (no backend)
const DEMO_UPLOADED: Document[] = [];
const DEMO_DELETED_IDS = new Set<string>();

function getDemoDocuments(): Document[] {
  const base = DEMO_DOCUMENTS.filter((d) => !DEMO_DELETED_IDS.has(d.id));
  return [...DEMO_UPLOADED, ...base];
}

function findDemoDocument(id: string): Document {
  return (
    DEMO_UPLOADED.find((d) => d.id === id) ||
    DEMO_DOCUMENTS.find((d) => d.id === id) || {
      id,
      filename: "Uploaded Document.txt",
      document_type: "txt",
      file_size: 0,
      page_count: 1,
      status: "ready" as const,
      created_at: new Date().toISOString(),
    }
  );
}

export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      if (!isConfigured()) return getDemoDocuments();
      try {
        const data = await api.documents.list();
        return data.length > 0 ? data : getDemoDocuments();
      } catch {
        return getDemoDocuments();
      }
    },
  });
}

export function useDocument(id: string) {
  return useQuery<Document>({
    queryKey: ["document", id],
    queryFn: async () => {
      if (!isConfigured()) {
        return findDemoDocument(id);
      }
      try {
        return await api.documents.get(id);
      } catch {
        return findDemoDocument(id);
      }
    },
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!isConfigured()) {
        const allowed = [".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"];
        const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
        if (!allowed.includes(ext)) {
          throw new Error(`Unsupported file type: ${ext}`);
        }
        if (file.size > 50 * 1024 * 1024) {
          throw new Error("File too large (max 50MB)");
        }
        const id = "demo-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
        const doc: Document = {
          id,
          filename: file.name,
          document_type: file.name.split(".").pop() || "unknown",
          file_size: file.size,
          page_count: 1,
          status: "uploaded" as const,
          created_at: new Date().toISOString(),
        };
        DEMO_UPLOADED.unshift(doc);
        queryClient.setQueryData<Document[]>(["documents"], getDemoDocuments());
        return doc;
      }
      return api.documents.upload(file);
    },
    onSuccess: () => {
      if (isConfigured()) {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    },
  });
}

export function useProcessDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isConfigured()) {
        const found = DEMO_UPLOADED.find((d) => d.id === id);
        if (found) {
          found.status = "ready";
          found.page_count = 1;
        }
        queryClient.setQueryData<Document[]>(["documents"], getDemoDocuments());
        queryClient.setQueryData(["document", id], findDemoDocument(id));
        return { document_id: id, status: "ready", sections_count: 4, clauses_count: 8, page_count: 1, id };
      }
      return api.documents.process(id);
    },
    onSuccess: (_, id) => {
      if (isConfigured()) {
        queryClient.invalidateQueries({ queryKey: ["document", id] });
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isConfigured()) {
        const idx = DEMO_UPLOADED.findIndex((d) => d.id === id);
        if (idx >= 0) DEMO_UPLOADED.splice(idx, 1);
        else DEMO_DELETED_IDS.add(id);
        queryClient.setQueryData<Document[]>(["documents"], getDemoDocuments());
        return { message: "deleted" };
      }
      return api.documents.delete(id);
    },
    onSuccess: () => {
      if (isConfigured()) {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    },
  });
}

export function useAnalyzeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, role, stance }: { documentId: string; role: string; stance: string }) =>
      api.analysis.run(documentId, role, stance),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ["risks", documentId] });
      queryClient.invalidateQueries({ queryKey: ["obligations", documentId] });
      queryClient.invalidateQueries({ queryKey: ["deadlines", documentId] });
    },
  });
}

export function useRisks(documentId: string) {
  return useQuery<RiskFinding[]>({
    queryKey: ["risks", documentId],
    queryFn: async () => {
      if (!isConfigured()) {
        return DEMO_RISK_FINDINGS.filter((r) => r.document_id === documentId);
      }
      try {
        const data = await api.analysis.getRisks(documentId);
        return data.length > 0 ? data : DEMO_RISK_FINDINGS.filter((r) => r.document_id === documentId);
      } catch {
        return DEMO_RISK_FINDINGS.filter((r) => r.document_id === documentId);
      }
    },
    enabled: !!documentId,
  });
}

export function useObligations(documentId: string) {
  return useQuery<Obligation[]>({
    queryKey: ["obligations", documentId],
    queryFn: async () => {
      if (!isConfigured()) {
        return DEMO_OBLIGATIONS.filter((o) => o.document_id === documentId);
      }
      try {
        const data = await api.analysis.getObligations(documentId);
        return data.length > 0 ? data : DEMO_OBLIGATIONS.filter((o) => o.document_id === documentId);
      } catch {
        return DEMO_OBLIGATIONS.filter((o) => o.document_id === documentId);
      }
    },
    enabled: !!documentId,
  });
}

export function useDeadlines(documentId: string) {
  return useQuery<Deadline[]>({
    queryKey: ["deadlines", documentId],
    queryFn: async () => {
      if (!isConfigured()) {
        return DEMO_DEADLINES.filter((d) => d.document_id === documentId);
      }
      try {
        const data = await api.analysis.getDeadlines(documentId);
        return data.length > 0 ? data : DEMO_DEADLINES.filter((d) => d.document_id === documentId);
      } catch {
        return DEMO_DEADLINES.filter((d) => d.document_id === documentId);
      }
    },
    enabled: !!documentId,
  });
}

export function useChat(documentId: string) {
  return useMutation({
    mutationFn: async (question: string): Promise<ChatResponse> => {
      if (!isConfigured()) {
        return { answer: getDemoChatAnswer(documentId, question), grounded: true, citations: [] };
      }
      return api.chat.ask(documentId, question);
    },
  });
}

export function useCompareDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      documentAId,
      documentBId,
    }: {
      documentAId: string;
      documentBId: string;
    }) => {
      if (!isConfigured()) {
        return {
          comparison_id: "demo-comparison",
          status: "completed",
          changes_count: DEMO_COMPARISON_CHANGES.length,
          changes: DEMO_COMPARISON_CHANGES,
        };
      }
      return api.comparisons.create(documentAId, documentBId);
    },
  });
}

export function useComparison(id: string) {
  return useQuery<Comparison>({
    queryKey: ["comparison", id],
    queryFn: () => api.comparisons.get(id),
    enabled: !!id,
  });
}

export function useConsultationSheet(documentId: string) {
  return useQuery<ConsultationSheet>({
    queryKey: ["consultation", documentId],
    queryFn: async () => {
      if (!isConfigured()) {
        return DEMO_CONSULTATION_SHEET;
      }
      try {
        return await api.consultation.get(documentId);
      } catch {
        return DEMO_CONSULTATION_SHEET;
      }
    },
    enabled: !!documentId,
  });
}

export function useGenerateConsultationSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => api.consultation.generate(documentId),
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ["consultation", documentId] });
    },
  });
}
