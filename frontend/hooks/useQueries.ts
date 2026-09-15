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

const DEMO_CHAT_ANSWERS: Record<string, Record<string, string>> = {
  "demo-svc-v1": {
    default: "Based on the Service Agreement, the key areas to review are:\n\n1. **Termination** (Section 2) - 30-day notice, auto-renewal with 60-day cancellation window\n2. **Compensation** (Section 3) - $10,000/month, non-refundable, 1.5% late penalty\n3. **Indemnification** (Section 4) - Broad, unlimited liability for Service Provider\n4. **IP** (Section 5) - All work product assigned to Client\n5. **Liability Cap** (Section 7) - Capped at 12 months fees (but Section 4.2 removes caps for consequential damages)",
    termination: "The agreement has several termination provisions under Section 2:\n\n1. **Initial Term**: 12 months from the Effective Date (Section 2.1)\n2. **Termination for Convenience**: Either party may terminate with 30 days written notice (Section 2.2)\n3. **Termination for Cause**: Client may terminate immediately if Service Provider breaches any material term (Section 2.3)\n4. **Auto-Renewal**: Automatically renews for 12-month periods unless 60 days written notice is given before the current term ends (Section 2.4)\n\nThe 60-day notice window for non-renewal is easy to miss, which could lock you into another full year.",
    financial: "Key financial risks in this agreement:\n\n1. **Non-Refundable Fees** (Section 3.4): ALL fees are non-refundable regardless of service quality or early termination.\n2. **Late Payment Penalty** (Section 3.3): 1.5% per month (18% annually) on overdue amounts, with only a 15-day payment window.\n3. **Uncapped Liability** (Section 4.2): Service Provider is liable for ALL direct, indirect, consequential, and punitive damages with no cap.\n4. **Auto-Renewal Lock-In** (Section 2.4): Missing the 60-day notice window commits you to another 12 months.",
    indemnification: "The indemnification provisions are heavily weighted against the Service Provider:\n\n**Section 4.1** - Service Provider must indemnify Client for ANY and ALL claims arising from any breach, including attorneys fees.\n\n**Section 4.2** - Service Provider is liable for ALL types of damages: direct, indirect, incidental, special, consequential, and punitive - with NO cap and regardless of cause.\n\n**Section 4.3** - Client only indemnifies Service Provider for claims arising from Client's use of the Services (much narrower).\n\nThis is a critical risk: the liability is unlimited and one-sided.",
    ip: "Intellectual Property provisions (Section 5):\n\n1. **Section 5.1**: ALL work product, deliverables, and materials become the sole and exclusive property of Client.\n2. **Section 5.2**: Service Provider retains pre-existing IP and tools.\n3. **Section 5.3**: Client gets a non-exclusive, perpetual, royalty-free license to use Service Provider's tools/methodologies.\n\nThe IP assignment is very broad. Consider adding carve-outs for open-source components and commonly used tools.",
  },
  "demo-emp": {
    noncompete: "The non-compete clause (Section 6.1) is extremely broad:\n\n**Restrictions** (18 months post-termination):\n- Cannot work for any direct competitor\n- Cannot solicit any employee or customer\n- Cannot disclose any trade secrets\n\n**Scope**: Worldwide, covering any company offering AI-powered analytics platforms (as determined solely by Employer).\n\n⚠️ This is likely unenforceable in many jurisdictions (e.g., California, where non-competes are generally void). The worldwide scope and vague 'direct competitor' definition make it particularly aggressive.",
    ip: "The IP assignment (Sections 5.1-5.2) is total and includes moral rights:\n\n**Section 5.1**: ALL inventions, discoveries, code, designs, and IP created during employment become sole property of Employer.\n\n**Section 5.2**: Employee assigns ALL rights including moral rights (the right to be credited as author).\n\n**No carve-outs**: No exception for personal projects, side projects, or work done on own time/equipment.\n\n⚠️ This means anything you create during employment - even on weekends on your own computer - belongs to the employer.",
    termination: "Employment is at-will with asymmetric termination:\n\n**Employee**: Must give 2 weeks written notice.\n**Employer**: Can terminate immediately for 'cause' including poor performance 'as determined solely by Employer' (Section 4.2).\n\n**Severance**: 2 weeks base pay per year of service, but only if you sign a release (Section 4.3).\n\n⚠️ 'Determined solely by Employer' means there's no appeal process for performance-based termination.",
    default: "Key employment terms:\n\n1. **Salary**: $145,000/year bi-weekly + discretionary bonus up to 20%\n2. **Non-Compete**: 18 months, worldwide (Section 6) - likely unenforceable\n3. **IP**: All inventions assigned to Employer including moral rights (Section 5)\n4. **Termination**: At-will, immediate for cause (Section 4)\n5. **Confidentiality**: Indefinite (Section 7)",
  },
  "demo-saas": {
    renewal: "The auto-renewal terms (Sections 2.2-2.3) are problematic:\n\n**Auto-Renewal**: Agreement renews for 12-month periods automatically.\n**Notice Required**: Only 30 days before term ends to cancel.\n**Early Termination Penalty**: If you cancel mid-term, you must pay ALL remaining fees for the current term.\n\n⚠️ You're essentially locked in for the full year. The 30-day notice window is easy to miss, and even if you catch it, you need to decide 30 days before the anniversary.",
    fees: "Fee structure and risks:\n\n1. **Base Fee**: $48,000/year ($4,000/month)\n2. **Late Fee**: 2.5% monthly (30% annually) - Section 3.3\n3. **No Refunds**: Fees are non-refundable, no credits for partial months - Section 3.4\n4. **Fee Increases**: Up to 10% per year at renewal with only 60 days notice - Section 3.5\n\n⚠️ Year-over-year cost could increase 10% without negotiation. Combined with the auto-renewal lock-in, this creates significant cost escalation risk.",
    data: "Data provisions (Section 4):\n\n1. **Data Ownership**: Customer retains all rights to its data.\n2. **Provider Access**: Provider may access data solely to provide the Service.\n3. **No Selling**: Provider cannot sell or share Customer data.\n4. **Export Window**: Only 30 days to export data after termination, then permanent deletion.\n5. **Security**: Industry-standard measures required.\n\n⚠️ The 30-day export window is tight. Plan your exit strategy before termination.",
    default: "Key SaaS terms:\n\n1. **Term**: 12 months, auto-renews (Section 2)\n2. **Fees**: $48K/year, no refunds, 10% annual increase possible (Section 3)\n3. **Data**: 30-day export window after termination (Section 4)\n4. **Liability**: Capped at 12 months fees, no consequential damages (Section 6)\n5. **SLA**: 99.5% uptime, 4-hour critical response (Section 8)",
  },
  "demo-lease": {
    rent: "Rent terms (Section 3):\n\n1. **Year 1**: $8,500/month\n2. **Annual Escalation**: 5% increase each year\n3. **Due Date**: 1st of each month\n4. **Late Fee**: $250 flat fee if not paid by the 5th\n5. **Interest**: Additional 1.5% monthly (18% annually) on overdue amounts\n\n⚠️ Year 3 rent would be ~$9,373/month (10% increase from Year 1). The combined late fee + interest is punitive.",
    deposit: "Security deposit (Section 4):\n\n1. **Amount**: $25,500 (3 months rent)\n2. **Refund**: Within 60 days of termination, less deductions\n3. **Application**: Landlord may apply deposit to unpaid rent or damages WITHOUT NOTICE (Section 4.3)\n\n⚠️ The 'without notice' clause means your deposit could be used before you even know there's a dispute.",
    default: "Key lease terms:\n\n1. **Term**: 3 years + two 3-year renewal options (Section 2)\n2. **Rent**: $8,500/month, 5% annual escalation (Section 3)\n3. **Deposit**: $25,500, applied without notice (Section 4)\n4. **Default**: Rent unpaid 5 days or covenant breached (Section 9)\n5. **Use**: Restaurant only, 7AM-11PM hours (Section 6)",
  },
  "demo-nda": {
    term: "Confidentiality term (Section 5):\n\n1. **Agreement Term**: 2 years from Effective Date\n2. **Confidentiality Survival**: Information must be returned or destroyed upon termination\n3. **No specific survival period**: The confidentiality obligations don't explicitly survive beyond the 2-year term\n\nCompare this to the Service Agreement where confidentiality survives for 3 years. For highly sensitive information, consider negotiating a longer survival period.",
    remedies: "Remedies for breach (Section 6):\n\n1. **Injunctive Relief**: Disclosing Party can seek court orders to stop disclosure (Section 6.1-6.2)\n2. **Full Damages**: Receiving Party liable for ALL damages from unauthorized disclosure (Section 6.3)\n3. **No Cap**: No limitation on damages liability\n\nThe combination of injunctive relief and uncapped damages creates significant exposure. A single inadvertent disclosure could result in substantial liability.",
    default: "Key NDA terms:\n\n1. **Duration**: 2 years (Section 5)\n2. **Scope**: Very broad definition of Confidential Information (Section 2)\n3. **Obligations**: Strict confidence, no disclosure, use only for Purpose (Section 3)\n4. **Remedies**: Injunctive relief + full damages (Section 6)\n5. **Governing Law**: New York (Section 7)",
  },
};

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
        const docAnswers = DEMO_CHAT_ANSWERS[documentId] || {};
        const q = question.toLowerCase();
        let answer = docAnswers.default || "This is a demo response. Configure Supabase and OpenAI API keys to enable real AI-powered analysis.";

        if (q.includes("terminat")) answer = docAnswers.termination || answer;
        else if (q.includes("financ") || q.includes("cost") || q.includes("fee") || q.includes("pay")) answer = docAnswers.financial || docAnswers.fees || docAnswers.rent || answer;
        else if (q.includes("indemnif") || q.includes("liabil")) answer = docAnswers.indemnification || answer;
        else if (q.includes("ip") || q.includes("intellectual") || q.includes("invent")) answer = docAnswers.ip || answer;
        else if (q.includes("non-compete") || q.includes("compete") || q.includes("restrict")) answer = docAnswers.noncompete || answer;
        else if (q.includes("renew") || q.includes("cancel") || q.includes("early")) answer = docAnswers.renewal || answer;
        else if (q.includes("data") || q.includes("export") || q.includes("privacy")) answer = docAnswers.data || answer;
        else if (q.includes("deposit") || q.includes("security")) answer = docAnswers.deposit || answer;
        else if (q.includes("remedy") || q.includes("breach") || q.includes(" damages")) answer = docAnswers.remedies || answer;
        else if (q.includes("term") && q.includes("nda")) answer = docAnswers.term || answer;

        return { answer, grounded: true, citations: [] };
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
