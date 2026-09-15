export interface User {
  user_id: string;
  email?: string;
  role?: string;
}

export interface Document {
  id: string;
  filename: string;
  document_type?: string;
  file_size?: number;
  page_count?: number;
  status: "uploaded" | "processing" | "ready" | "failed";
  processing_error?: string;
  created_at: string;
  processed_at?: string;
}

export interface Analysis {
  id: string;
  document_id: string;
  role: string;
  negotiation_stance: string;
  overall_score?: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export interface RiskFinding {
  id: string;
  analysis_id: string;
  document_id: string;
  clause_id?: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  score?: number;
  title: string;
  explanation?: string;
  potential_impact?: string;
  evidence?: string;
  source_page?: number;
  source_section?: string;
}

export interface Obligation {
  id: string;
  document_id: string;
  clause_id?: string;
  party?: string;
  action?: string;
  deadline?: string;
  condition?: string;
  source?: string;
}

export interface Deadline {
  id: string;
  document_id: string;
  date_type: string;
  date_value: string;
  description?: string;
  source_section?: string;
  source_page?: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  grounded?: boolean;
  created_at: string;
}

export interface Citation {
  section?: string;
  page?: number;
  text: string;
}

export interface ChatResponse {
  answer: string;
  grounded: boolean;
  citations: Citation[];
}

export interface ComparisonChange {
  id: string;
  comparison_id: string;
  change_type: string;
  section?: string;
  severity?: string;
  description?: string;
  evidence_a?: string;
  evidence_b?: string;
}

export interface Comparison {
  id: string;
  document_a_id: string;
  document_b_id: string;
  status: string;
  changes: ComparisonChange[];
  created_at: string;
  completed_at?: string;
}

export interface ConsultationSheet {
  id: string;
  document_id: string;
  content: {
    document_name: string;
    contract_type?: string;
    user_role: string;
    executive_overview?: string;
    top_risks: string[];
    important_obligations: string[];
    important_deadlines: string[];
    ambiguous_clauses: string[];
    questions_for_lawyer: string[];
    clauses_requiring_review: string[];
  };
  created_at: string;
}

export interface RiskScore {
  overall_score: number;
  classification: string;
  factors: Record<string, number>;
  summary: string;
}

export type UserRole =
  | "Buyer"
  | "Supplier"
  | "Customer"
  | "Service Provider"
  | "Tenant"
  | "Landlord"
  | "Employee"
  | "Employer"
  | "Contractor"
  | "Freelancer"
  | "General Party";

export type NegotiationStance = "Aggressive" | "Balanced" | "Flexible";
