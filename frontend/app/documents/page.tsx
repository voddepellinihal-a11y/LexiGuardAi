"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments, useDeleteDocument } from "@/hooks/useQueries";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { DocumentUpload } from "@/components/DocumentUpload";
import { StatusBadge } from "@/components/StatusBadge";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import Link from "next/link";
import { FileText, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { data: documents, isLoading } = useDocuments();
  const deleteMutation = useDeleteDocument();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main id="main-content" className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-page-title text-primary">Documents</h1>
              <p className="text-text-secondary mt-1">
                Upload and manage your legal documents.
              </p>
            </div>

            <DocumentUpload />

            <div>
              <h2 className="text-section-title font-semibold text-primary mb-4">
                Your Documents
              </h2>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="h-4 bg-surface-muted rounded w-1/3" />
                      <div className="h-3 bg-surface-muted rounded w-1/4 mt-2" />
                    </div>
                  ))}
                </div>
              ) : !documents || documents.length === 0 ? (
                <div className="card text-center py-12">
                  <FileText aria-hidden="true" className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-card-title font-semibold text-primary mb-2">
                    No documents yet
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Upload your first document to begin your legal analysis.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="card">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                        >
                          <FileText aria-hidden="true" className="h-5 w-5 text-text-muted" />
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-text-primary">
                              {doc.filename}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar aria-hidden="true" className="h-3 w-3" />
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                              {doc.file_size && (
                                <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                              )}
                              {doc.page_count && <span>{doc.page_count} pages</span>}
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={doc.status} />
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${doc.filename}`}
                            onClick={() => {
                              if (confirm("Delete this document?")) {
                                deleteMutation.mutate(doc.id);
                              }
                            }}
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4 text-text-muted hover:text-risk-high" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center py-4">
              <LegalDisclaimer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
