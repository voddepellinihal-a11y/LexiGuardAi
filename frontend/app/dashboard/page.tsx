"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments } from "@/hooks/useQueries";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { FileText, Upload, GitCompare, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { data: documents, isLoading } = useDocuments();

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

  const recentDocs = documents?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main id="main-content" className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-page-title text-primary">Dashboard</h1>
              <p className="text-text-secondary mt-1">
                Welcome back. Upload and analyze your legal documents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/documents">
                <div className="card hover:border-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-primary">Upload Document</h3>
                      <p className="text-xs text-text-muted">Analyze a new contract</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/compare">
                <div className="card hover:border-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                      <GitCompare className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-primary">Compare Documents</h3>
                      <p className="text-xs text-text-muted">Semantic version comparison</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/documents">
                <div className="card hover:border-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-risk-info/15 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-risk-info" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-primary">Ask AI</h3>
                      <p className="text-xs text-text-muted">Question about a document</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-section-title font-semibold text-primary">
                  Recent Documents
                </h2>
                <Link href="/documents">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="h-4 bg-surface-muted rounded w-1/3" />
                      <div className="h-3 bg-surface-muted rounded w-1/4 mt-2" />
                    </div>
                  ))}
                </div>
              ) : recentDocs.length === 0 ? (
                <div className="card text-center py-12">
                  <FileText className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-card-title font-semibold text-primary mb-2">
                    No documents yet
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Upload your first document to begin your legal analysis.
                  </p>
                  <Link href="/documents">
                    <Button className="btn-primary">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocs.map((doc) => (
                    <Link key={doc.id} href={`/documents/${doc.id}`}>
                      <div className="card hover:border-accent transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-text-muted" />
                            <div>
                              <h3 className="text-sm font-medium text-text-primary">
                                {doc.filename}
                              </h3>
                              <p className="text-xs text-text-muted">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={doc.status} />
                          </div>
                        </div>
                      </div>
                    </Link>
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
