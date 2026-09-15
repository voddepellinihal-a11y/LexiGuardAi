import type {
  Document,
  RiskFinding,
  Obligation,
  Deadline,
  ComparisonChange,
  Comparison,
  ConsultationSheet,
} from "@/types";

// Demo documents - shown when backend returns empty or 401
export const DEMO_DOCUMENTS: Document[] = [
  {
    id: "demo-svc-v1",
    filename: "Service_Agreement_v1.txt",
    document_type: "service_agreement",
    file_size: 3200,
    page_count: 2,
    status: "ready",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "demo-svc-v2",
    filename: "Service_Agreement_v2.txt",
    document_type: "service_agreement",
    file_size: 3800,
    page_count: 2,
    status: "ready",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "demo-nda",
    filename: "NDA_InnovateTech.txt",
    document_type: "nda",
    file_size: 2400,
    page_count: 1,
    status: "ready",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "demo-emp",
    filename: "Employment_Agreement.txt",
    document_type: "employment",
    file_size: 4100,
    page_count: 3,
    status: "ready",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "demo-saas",
    filename: "SaaS_Subscription.txt",
    document_type: "saas_subscription",
    file_size: 3500,
    page_count: 2,
    status: "ready",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "demo-lease",
    filename: "Commercial_Lease.txt",
    document_type: "commercial_lease",
    file_size: 3900,
    page_count: 2,
    status: "ready",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const DEMO_RISK_FINDINGS: RiskFinding[] = [
  // Service Agreement - Service Provider / Aggressive
  {
    id: "risk-1",
    analysis_id: "demo-analysis-svc",
    document_id: "demo-svc-v1",
    category: "unlimited_liability",
    severity: "critical",
    score: 95,
    title: "Uncapped Consequential Damages",
    explanation:
      "Section 4.2 imposes unlimited liability for all direct, indirect, incidental, special, consequential, and punitive damages with no cap.",
    potential_impact:
      "Exposure to potentially unlimited financial liability for any claim, even minor breaches.",
    evidence:
      'Service Provider shall be liable for all direct, indirect, incidental, special, consequential, and punitive damages arising out of or relating to this Agreement, regardless of the cause of action or the theory of liability.',
    source_page: 1,
  },
  {
    id: "risk-2",
    analysis_id: "demo-analysis-svc",
    document_id: "demo-svc-v1",
    category: "unlimited_indemnification",
    severity: "high",
    score: 82,
    title: "Broad Indemnification Obligation",
    explanation:
      "Section 4.1 requires unlimited indemnification for any and all claims, with no carve-outs for negligence or gross negligence by Client.",
    potential_impact:
      "Financial exposure for claims that may not be within Service Provider control.",
    evidence:
      "Service Provider shall indemnify, defend, and hold harmless Client from any and all claims, damages, losses, costs, and expenses arising out of any breach.",
    source_page: 1,
  },
  {
    id: "risk-3",
    analysis_id: "demo-analysis-svc",
    document_id: "demo-svc-v1",
    category: "unfavorable_payment",
    severity: "high",
    score: 78,
    title: "Non-Refundable Fees",
    explanation:
      "Section 3.4 makes all fees non-refundable regardless of service quality or early termination.",
    potential_impact:
      "No recourse if services are unsatisfactory or contract terminates early.",
    evidence: "All fees are non-refundable.",
    source_page: 1,
  },
  {
    id: "risk-4",
    analysis_id: "demo-analysis-svc",
    document_id: "demo-svc-v1",
    category: "auto_renewal",
    severity: "medium",
    score: 65,
    title: "Auto-Renewal with Narrow Cancellation Window",
    explanation:
      "Section 2.4 auto-renews for 12-month periods requiring 60-day advance notice. Missing the window locks in another full year.",
    potential_impact:
      "Unintended financial commitment if notice deadline is missed.",
    evidence:
      "This Agreement shall automatically renew for successive twelve (12) month periods unless either party provides written notice of non-renewal at least sixty (60) days prior.",
    source_page: 1,
  },
  {
    id: "risk-5",
    analysis_id: "demo-analysis-svc",
    document_id: "demo-svc-v1",
    category: "excessive_penalties",
    severity: "medium",
    score: 58,
    title: "Late Payment Penalty",
    explanation:
      "Section 3.3 imposes 1.5% monthly penalty (18% annually) on late payments with only 15-day payment window.",
    potential_impact:
      "Significant financial penalty for minor payment delays.",
    evidence:
      "Late payments shall incur a penalty of 1.5% per month on the outstanding balance.",
    source_page: 1,
  },
  {
    id: "risk-6",
    analysis_id: "demo-analysis-svc",
    document_id: "demo-svc-v1",
    category: "missing_limitation",
    severity: "low",
    score: 42,
    title: "Liability Cap Only on One Side",
    explanation:
      "Section 7 caps Service Provider liability but Section 4.2 removes caps for consequential damages, creating inconsistency.",
    potential_impact: "Potential ambiguity in liability allocation.",
    evidence:
      "Service Providers total aggregate liability shall not exceed the fees paid by Client in the twelve (12) months preceding the claim.",
    source_page: 1,
  },
  {
    id: "risk-7",
    analysis_id: "demo-analysis-svc",
    document_id: "demo-svc-v1",
    category: "ip_ownership",
    severity: "info",
    score: 25,
    title: "Broad IP Assignment",
    explanation:
      "Section 5.1 assigns all work product as sole property of Client. Consider carve-outs for pre-existing IP.",
    potential_impact:
      "Risk of losing rights to commonly used tools and methodologies.",
    evidence:
      "All work product, deliverables, and materials created by Service Provider shall be the sole and exclusive property of Client.",
    source_page: 1,
  },

  // Employment Agreement - Employee / Aggressive
  {
    id: "risk-8",
    analysis_id: "demo-analysis-emp",
    document_id: "demo-emp",
    category: "non_compete",
    severity: "critical",
    score: 92,
    title: "Worldwide Non-Compete for 18 Months",
    explanation:
      "Section 6.1 imposes an 18-month worldwide non-compete covering any direct competitor. Extremely broad.",
    potential_impact:
      "Complete career restriction for 18 months post-termination across entire industry globally.",
    evidence:
      "For a period of eighteen (18) months following termination, Employee shall not work for any direct competitor.",
    source_page: 2,
  },
  {
    id: "risk-9",
    analysis_id: "demo-analysis-emp",
    document_id: "demo-emp",
    category: "ip_ownership",
    severity: "critical",
    score: 90,
    title: "Total IP Assignment with Moral Rights",
    explanation:
      "Sections 5.1-5.2 assign ALL inventions and IP created during employment, including moral rights, with no carve-outs.",
    potential_impact:
      "Employee loses all rights to any creative work, including side projects.",
    evidence:
      "All inventions, discoveries, code, designs, and intellectual property created during employment shall be sole property of Employer. Employee assigns all rights including moral rights.",
    source_page: 2,
  },
  {
    id: "risk-10",
    analysis_id: "demo-analysis-emp",
    document_id: "demo-emp",
    category: "unilateral_termination",
    severity: "high",
    score: 80,
    title: "Unilateral Termination for Cause",
    explanation:
      "Section 4.2 allows Employer to terminate immediately for poor performance as determined solely by Employer.",
    potential_impact:
      "Job security is essentially non-existent; subjective performance judgment.",
    evidence:
      "Employer may terminate immediately for cause including poor performance as determined solely by Employer.",
    source_page: 1,
  },
  {
    id: "risk-11",
    analysis_id: "demo-analysis-emp",
    document_id: "demo-emp",
    category: "restrictive_obligations",
    severity: "high",
    score: 76,
    title: "Broad Non-Solicitation",
    explanation:
      "Section 6.1 prohibits soliciting any employee or customer for 18 months.",
    potential_impact:
      "Cannot contact former colleagues or clients for nearly 2 years.",
    evidence:
      "Employee shall not solicit any employee or customer of Employer.",
    source_page: 2,
  },
  {
    id: "risk-12",
    analysis_id: "demo-analysis-emp",
    document_id: "demo-emp",
    category: "unfavorable_payment",
    severity: "medium",
    score: 55,
    title: "Discretionary Bonus",
    explanation:
      "Section 3.3 states bonus is at Employer sole discretion.",
    potential_impact: "Expected bonus income is not guaranteed.",
    evidence:
      "Annual performance bonus up to 20% of base salary, at Employers sole discretion.",
    source_page: 1,
  },

  // SaaS Subscription - Customer / Balanced
  {
    id: "risk-13",
    analysis_id: "demo-analysis-saas",
    document_id: "demo-saas",
    category: "auto_renewal",
    severity: "critical",
    score: 85,
    title: "Auto-Renewal with Early Termination Penalty",
    explanation:
      "Sections 2.2-2.3 auto-renew for 12 months and require payment of ALL remaining fees if Customer terminates early.",
    potential_impact:
      "Locked into paying full annual fee even if service is cancelled mid-term.",
    evidence:
      "Early termination by Customer requires payment of all remaining fees for the current term.",
    source_page: 1,
  },
  {
    id: "risk-14",
    analysis_id: "demo-analysis-saas",
    document_id: "demo-saas",
    category: "unfavorable_payment",
    severity: "high",
    score: 77,
    title: "No Refunds or Credits",
    explanation:
      "Section 3.4 explicitly states fees are non-refundable with no credits for partial months.",
    potential_impact:
      "No financial recourse for service outages or dissatisfaction.",
    evidence: "Fees are non-refundable. No credits for partial months.",
    source_page: 1,
  },
  {
    id: "risk-15",
    analysis_id: "demo-analysis-saas",
    document_id: "demo-saas",
    category: "excessive_penalties",
    severity: "high",
    score: 72,
    title: "High Late Payment Penalty",
    explanation:
      "Section 3.3 imposes 2.5% monthly interest (30% annually) on late payments.",
    potential_impact: "Penalty rate significantly exceeds market rates.",
    evidence: "Late payments accrue interest at 2.5% per month.",
    source_page: 1,
  },
  {
    id: "risk-16",
    analysis_id: "demo-analysis-saas",
    document_id: "demo-saas",
    category: "auto_renewal",
    severity: "medium",
    score: 60,
    title: "Short Notice Period for Non-Renewal",
    explanation:
      "Section 2.2 requires only 30 days notice before auto-renewal.",
    potential_impact: "Unintended renewal if notice deadline is missed.",
    evidence:
      "Customer provides notice of non-renewal at least thirty (30) days prior.",
    source_page: 1,
  },
  {
    id: "risk-17",
    analysis_id: "demo-analysis-saas",
    document_id: "demo-saas",
    category: "missing_protections",
    severity: "low",
    score: 40,
    title: "Limited Data Export Window",
    explanation:
      "Section 4.5 provides only 30 days to export data after termination.",
    potential_impact: "Risk of data loss if export is not completed quickly.",
    evidence:
      "Provider shall make data available for export for thirty (30) days, then delete all data.",
    source_page: 1,
  },

  // Commercial Lease - Tenant / Flexible
  {
    id: "risk-18",
    analysis_id: "demo-analysis-lease",
    document_id: "demo-lease",
    category: "unfavorable_payment",
    severity: "high",
    score: 79,
    title: "High Late Fees and Interest",
    explanation:
      "Sections 3.4-3.5 impose $250 flat late fee plus 1.5% monthly interest with only 5-day grace period.",
    potential_impact: "Significant cost for minor payment delays.",
    evidence:
      "Late fee: $250 if rent not received by the 5th. Additional 1.5% monthly interest.",
    source_page: 1,
  },
  {
    id: "risk-19",
    analysis_id: "demo-analysis-lease",
    document_id: "demo-lease",
    category: "missing_protections",
    severity: "high",
    score: 74,
    title: "Deposit Application Without Notice",
    explanation:
      "Section 4.3 allows Landlord to apply security deposit without any notice to Tenant.",
    potential_impact: "No opportunity to cure before deposit is used.",
    evidence:
      "Landlord may apply deposit to unpaid rent or damages without notice.",
    source_page: 1,
  },
  {
    id: "risk-20",
    analysis_id: "demo-analysis-lease",
    document_id: "demo-lease",
    category: "unilateral_termination",
    severity: "medium",
    score: 62,
    title: "Broad Default Definition",
    explanation:
      "Section 9.1 defines default as rent unpaid for 5 days or any covenant breached.",
    potential_impact: "Minor breach could lead to lease termination.",
    evidence:
      "Tenant in default if rent unpaid for five (5) days or any covenant breached and not cured within thirty (30) days.",
    source_page: 1,
  },
];

export const DEMO_OBLIGATIONS: Obligation[] = [
  {
    id: "obl-1",
    document_id: "demo-svc-v1",
    party: "Service Provider",
    action: "Perform services in professional manner",
    deadline: "Ongoing",
    condition: "During term",
    source: "Section 1.2",
  },
  {
    id: "obl-2",
    document_id: "demo-svc-v1",
    party: "Client",
    action: "Pay monthly fee of $10,000",
    deadline: "Within 15 days of invoice",
    condition: "Monthly",
    source: "Section 3.1",
  },
  {
    id: "obl-3",
    document_id: "demo-emp",
    party: "Employee",
    action: "Devote full time and best efforts",
    deadline: "During employment",
    condition: "Always",
    source: "Section 1.2",
  },
  {
    id: "obl-4",
    document_id: "demo-emp",
    party: "Employer",
    action: "Pay bi-weekly salary of $145,000/year",
    deadline: "Bi-weekly",
    condition: "During employment",
    source: "Section 2.1",
  },
  {
    id: "obl-5",
    document_id: "demo-saas",
    party: "Customer",
    action: "Pay monthly installment of $4,000",
    deadline: "Within 15 days of invoice",
    condition: "Monthly",
    source: "Section 3.1",
  },
  {
    id: "obl-6",
    document_id: "demo-saas",
    party: "Provider",
    action: "Maintain 99.5% uptime",
    deadline: "Ongoing",
    condition: "During term",
    source: "Section 1.3",
  },
  {
    id: "obl-7",
    document_id: "demo-lease",
    party: "Tenant",
    action: "Pay monthly rent of $8,500",
    deadline: "1st of each month",
    condition: "Monthly",
    source: "Section 3.1",
  },
  {
    id: "obl-8",
    document_id: "demo-lease",
    party: "Landlord",
    action: "Maintain structural repairs",
    deadline: "As needed",
    condition: "When required",
    source: "Section 5.1",
  },
];

export const DEMO_DEADLINES: Deadline[] = [
  {
    id: "dl-1",
    document_id: "demo-svc-v1",
    date_type: "payment",
    date_value: "Within 15 days of invoice",
    description: "Monthly fee payment - $10,000",
    source_section: "Section 3.1",
  },
  {
    id: "dl-2",
    document_id: "demo-svc-v1",
    date_type: "notice",
    date_value: "60 days before term end",
    description: "Non-renewal notice deadline",
    source_section: "Section 2.4",
  },
  {
    id: "dl-3",
    document_id: "demo-saas",
    date_type: "notice",
    date_value: "30 days before term end",
    description: "Non-renewal notice deadline",
    source_section: "Section 2.2",
  },
  {
    id: "dl-4",
    document_id: "demo-lease",
    date_type: "payment",
    date_value: "1st of each month",
    description: "Monthly rent payment - $8,500",
    source_section: "Section 3.1",
  },
  {
    id: "dl-5",
    document_id: "demo-emp",
    date_type: "other",
    date_value: "Within 30 days of start",
    description: "Signing bonus payment - $15,000",
    source_section: "Section 2.2",
  },
];

export const DEMO_COMPARISON_CHANGES: ComparisonChange[] = [
  {
    id: "cc-1",
    comparison_id: "demo-comparison",
    change_type: "modified_clause",
    section: "2.1",
    severity: "medium",
    description: "Term extended from 12 to 24 months",
    evidence_a: "continue for a period of twelve (12) months",
    evidence_b: "continue for a period of twenty-four (24) months",
  },
  {
    id: "cc-2",
    comparison_id: "demo-comparison",
    change_type: "shifted_liability",
    section: "3.1",
    severity: "medium",
    description: "Monthly fee increased from $10,000 to $12,000",
    evidence_a: "monthly fee of $10,000",
    evidence_b: "monthly fee of $12,000",
  },
  {
    id: "cc-3",
    comparison_id: "demo-comparison",
    change_type: "added_obligation",
    section: "3.5",
    severity: "high",
    description: "New $24,000 retainer requirement added",
    evidence_a: "",
    evidence_b: "Client shall provide a retainer of $24,000 prior to commencement",
  },
  {
    id: "cc-4",
    comparison_id: "demo-comparison",
    change_type: "omitted_protection",
    section: "4.2",
    severity: "high",
    description: "Uncapped liability clause REMOVED (beneficial to Service Provider)",
    evidence_a: "liable for all direct, indirect, incidental, special, consequential, and punitive damages",
    evidence_b: "",
  },
  {
    id: "cc-5",
    comparison_id: "demo-comparison",
    change_type: "added_obligation",
    section: "8.1",
    severity: "high",
    description: "New non-compete clause added (12 months, California)",
    evidence_a: "",
    evidence_b: "Service Provider shall not provide substantially similar services to any direct competitor",
  },
  {
    id: "cc-6",
    comparison_id: "demo-comparison",
    change_type: "modified_clause",
    section: "3.3",
    severity: "medium",
    description: "Late payment penalty increased from 1.5% to 2.0% monthly",
    evidence_a: "penalty of 1.5% per month",
    evidence_b: "penalty of 2.0% per month",
  },
];

export const DEMO_CONSULTATION_SHEET: ConsultationSheet = {
  id: "demo-sheet",
  document_id: "demo-svc-v1",
  content: {
    document_name: "Service_Agreement_v1.txt",
    contract_type: "Service Agreement",
    user_role: "Service Provider",
    executive_overview:
      "This Service Agreement with TechCorp Inc. presents moderate-to-high risk for a Service Provider. The primary concerns are unlimited liability exposure under Section 4.2, broad indemnification obligations, and non-refundable fees.",
    top_risks: [
      "CRITICAL: Uncapped consequential damages liability (Section 4.2) - unlimited financial exposure",
      "HIGH: Broad indemnification with no carve-outs (Section 4.1) - liable for any and all claims",
      "HIGH: All fees non-refundable (Section 3.4) - no recourse for unsatisfactory services",
    ],
    important_obligations: [
      "Perform services in professional manner (Section 1.2)",
      "Indemnify Client for all claims arising from any breach (Section 4.1)",
      "Deliver all work product as sole property of Client (Section 5.1)",
    ],
    important_deadlines: [
      "Payment due within 15 days of invoice (Section 3.1)",
      "60 days notice required for non-renewal (Section 2.4)",
      "30 days notice required for termination (Section 2.2)",
    ],
    ambiguous_clauses: [
      "Section 1.2: professional and workmanlike manner - not defined",
      "Section 2.3: material term - not defined",
      "Section 4.1: reasonable attorneys fees - no cap specified",
    ],
    questions_for_lawyer: [
      "Can we negotiate a mutual liability cap instead of the one-sided cap in Section 7?",
      "Is the 18% annual late payment penalty enforceable in this jurisdiction?",
      "Should we add a carve-out for gross negligence in the indemnification?",
      "Can we negotiate a refund or credit mechanism for unused services?",
      "What are the implications of the auto-renewal clause if we miss the 60-day window?",
    ],
    clauses_requiring_review: [
      "Section 4.2: Uncapped liability for consequential damages",
      "Section 4.1: Broad indemnification obligation",
      "Section 3.4: Non-refundable fees",
      "Section 2.4: Auto-renewal terms",
    ],
  },
  created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
};
