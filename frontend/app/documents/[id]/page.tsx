"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  useDocument,
  useRisks,
  useObligations,
  useDeadlines,
  useAnalyzeDocument,
  useGenerateConsultationSheet,
  useConsultationSheet,
} from "@/hooks/useQueries";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { StatusBadge } from "@/components/StatusBadge";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { RiskFindingCard } from "@/components/RiskFindingCard";
import { RoleSelector } from "@/components/RoleSelector";
import { AIChat } from "@/components/AIChat";
import { ConsultationSheet } from "@/components/ConsultationSheet";
import { Loader2, FileText, AlertTriangle, BookOpen, ListChecks, Clock, MessageSquare, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole, NegotiationStance } from "@/types";

const tabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "risks", label: "Risks", icon: AlertTriangle },
  { id: "clauses", label: "Clauses", icon: BookOpen },
  { id: "obligations", label: "Obligations", icon: ListChecks },
  { id: "deadlines", label: "Deadlines", icon: Clock },
  { id: "chat", label: "Ask AI", icon: MessageSquare },
  { id: "consultation", label: "Consultation", icon: FileCheck },
];

export default function DocumentDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [role, setRole] = useState<UserRole>("General Party");
  const [stance, setStance] = useState<NegotiationStance>("Balanced");

  const { data: document, isLoading: docLoading } = useDocument(documentId);
  const { data: risks = [] } = useRisks(documentId);
  const { data: obligations = [] } = useObligations(documentId);
  const { data: deadlines = [] } = useDeadlines(documentId);
  const analyzeMutation = useAnalyzeDocument();
  const generateSheetMutation = useGenerateConsultationSheet();
  const { data: consultationSheet } = useConsultationSheet(documentId);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || docLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !document) return null;

  const handleAnalyze = () => {
    analyzeMutation.mutate({
      documentId,
      role,
      stance,
    });
  };

  const highRisks = risks.filter((r) => r.severity === "high" || r.severity === "critical");
  const mediumRisks = risks.filter((r) => r.severity === "medium");
  const lowRisks = risks.filter((r) => r.severity === "low");

  const latestScore = risks.length > 0 ? Math.round(risks.reduce((acc, r) => acc + (r.score || 0), 0) / risks.length) : 0;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main id="main-content" className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-page-title text-primary">{document.filename}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
                  <StatusBadge status={document.status} />
                  {document.document_type && <span>{document.document_type}</span>}
                  {document.page_count && <span>{document.page_count} pages</span>}
                </div>
              </div>
            </div>

            {document.status === "uploaded" && (
              <div className="card">
                <h3 className="text-card-title font-semibold text-primary mb-4">
                  Configure Analysis
                </h3>
                <RoleSelector
                  role={role}
                  stance={stance}
                  onRoleChange={setRole}
                  onStanceChange={setStance}
                />
                <Button
                  className="btn-primary mt-4"
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Run Analysis
                </Button>
              </div>
            )}

            {document.status === "processing" && (
              <div className="card text-center py-8" role="status" aria-live="polite">
                <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
                <p className="text-text-secondary">Processing document...</p>
                <p className="text-xs text-text-muted mt-1">
                  Parsing, extracting clauses, and building knowledge index
                </p>
              </div>
            )}

            {document.status === "failed" && (
              <div className="card text-center py-8 border-risk-high/30" role="alert">
                <AlertTriangle aria-hidden="true" className="h-8 w-8 text-risk-high mx-auto mb-3" />
                <p className="text-risk-high font-medium">Processing Failed</p>
                <p className="text-sm text-text-secondary mt-1">
                  {document.processing_error || "An error occurred while processing the document."}
                </p>
              </div>
            )}

            {document.status === "ready" && (
              <>
                <div role="tablist" aria-label="Document sections" className="flex gap-1 border-b border-border overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      id={`tab-${tab.id}`}
                      aria-selected={activeTab === tab.id}
                      aria-controls={`tabpanel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-t-md ${
                        activeTab === tab.id
                          ? "border-accent text-accent"
                          : "border-transparent text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <tab.icon aria-hidden="true" className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "overview" && (
                  <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <RiskScoreCard
                        score={latestScore}
                        classification={
                          latestScore <= 20
                            ? "Very Low"
                            : latestScore <= 40
                            ? "Low"
                            : latestScore <= 60
                            ? "Moderate"
                            : latestScore <= 80
                            ? "High"
                            : "Critical"
                        }
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                      <div className="card">
                        <h3 className="text-card-title font-semibold text-primary mb-3">
                          Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-risk-high">{highRisks.length}</p>
                            <p className="text-xs text-text-muted">High Risks</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-risk-medium">{mediumRisks.length}</p>
                            <p className="text-xs text-text-muted">Medium Risks</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-risk-low">{lowRisks.length}</p>
                            <p className="text-xs text-text-muted">Low Risks</p>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <h3 className="text-card-title font-semibold text-primary mb-3">
                          Quick Actions
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => setActiveTab("risks")}>
                            View Risks
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setActiveTab("chat")}>
                            Ask AI
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateSheetMutation.mutate(documentId)}
                            disabled={generateSheetMutation.isPending}
                          >
                            {generateSheetMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : null}
                            Generate Consultation Sheet
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "risks" && (
                  <div role="tabpanel" id="tabpanel-risks" aria-labelledby="tab-risks" className="space-y-4">
                    {risks.length === 0 ? (
                      <div className="card text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-card-title font-semibold text-primary mb-2">
                          No risks identified
                        </h3>
                        <p className="text-sm text-text-secondary">
                          No significant risks were identified by the current analysis.
                          This does not guarantee the document is legally safe.
                        </p>
                      </div>
                    ) : (
                      risks.map((risk) => (
                        <RiskFindingCard
                          key={risk.id}
                          finding={risk}
                          onAskAI={(q) => {
                            setActiveTab("chat");
                          }}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === "clauses" && (
                  <div role="tabpanel" id="tabpanel-clauses" aria-labelledby="tab-clauses" className="space-y-4">
                    {risks.length === 0 ? (
                      <div className="card text-center py-12">
                        <BookOpen className="h-12 w-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-card-title font-semibold text-primary mb-2">
                          No clauses extracted
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Clause extraction is part of the analysis process.
                        </p>
                      </div>
                    ) : (
                      risks.map((risk) => (
                        <div key={risk.id} className="card">
                          <h3 className="text-sm font-semibold text-primary">{risk.title}</h3>
                          <p className="text-xs text-text-muted mt-1">
                            {risk.source_section && `Section ${risk.source_section}`}
                            {risk.source_page && ` · Page ${risk.source_page}`}
                          </p>
                          {risk.evidence && (
                            <div className="legal-text bg-surface-muted p-3 rounded-md text-sm mt-3">
                              {risk.evidence}
                            </div>
                          )}
                          <p className="text-sm text-text-secondary mt-3">{risk.explanation}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "obligations" && (
                  <div role="tabpanel" id="tabpanel-obligations" aria-labelledby="tab-obligations" className="space-y-4">
                    {obligations.length === 0 ? (
                      <div className="card text-center py-12">
                        <ListChecks className="h-12 w-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-card-title font-semibold text-primary mb-2">
                          No obligations found
                        </h3>
                        <p className="text-sm text-text-secondary">
                          No specific obligations were identified in this document.
                        </p>
                      </div>
                    ) : (
                      obligations.map((obl) => (
                        <div key={obl.id} className="card">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {obl.action}
                              </p>
                              <p className="text-xs text-text-muted mt-1">
                                Party: {obl.party}
                                {obl.deadline && ` · Deadline: ${obl.deadline}`}
                                {obl.source && ` · Source: ${obl.source}`}
                              </p>
                            </div>
                          </div>
                          {obl.condition && (
                            <p className="text-xs text-text-secondary mt-2">
                              Condition: {obl.condition}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "deadlines" && (
                  <div role="tabpanel" id="tabpanel-deadlines" aria-labelledby="tab-deadlines" className="space-y-4">
                    {deadlines.length === 0 ? (
                      <div className="card text-center py-12">
                        <Clock className="h-12 w-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-card-title font-semibold text-primary mb-2">
                          No deadlines found
                        </h3>
                        <p className="text-sm text-text-secondary">
                          No specific deadlines were identified in this document.
                        </p>
                      </div>
                    ) : (
                      deadlines.map((dl) => (
                        <div key={dl.id} className="card">
                          <p className="text-sm font-medium text-text-primary">{dl.date_value}</p>
                          <p className="text-xs text-text-muted mt-1">
                            {dl.date_type}
                            {dl.description && ` · ${dl.description}`}
                            {dl.source_section && ` · Section ${dl.source_section}`}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "chat" && (
                  <div role="tabpanel" id="tabpanel-chat" aria-labelledby="tab-chat" className="card">
                    <AIChat documentId={documentId} documentName={document.filename} />
                  </div>
                )}

                {activeTab === "consultation" && (
                  <div role="tabpanel" id="tabpanel-consultation" aria-labelledby="tab-consultation">
                    {consultationSheet ? (
                      <ConsultationSheet sheet={consultationSheet} />
                    ) : (
                      <div className="card text-center py-12">
                        <FileCheck className="h-12 w-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-card-title font-semibold text-primary mb-2">
                          No consultation sheet yet
                        </h3>
                        <p className="text-sm text-text-secondary mb-4">
                          Generate a preparation sheet for your lawyer consultation.
                        </p>
                        <Button
                          className="btn-primary"
                          onClick={() => generateSheetMutation.mutate(documentId)}
                          disabled={generateSheetMutation.isPending}
                        >
                          {generateSheetMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Generate Consultation Sheet
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="text-center py-4">
              <LegalDisclaimer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
