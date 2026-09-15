"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments, useCompareDocuments } from "@/hooks/useQueries";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { ComparisonView } from "@/components/ComparisonView";
import { FileText, Loader2, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComparePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { data: documents } = useDocuments();
  const compareMutation = useCompareDocuments();

  const [docA, setDocA] = useState("");
  const [docB, setDocB] = useState("");
  const [result, setResult] = useState<any>(null);

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

  const handleCompare = async () => {
    if (!docA || !docB) return;
    try {
      const res = await compareMutation.mutateAsync({
        documentAId: docA,
        documentBId: docB,
      });
      setResult(res);
    } catch (error) {
      console.error("Comparison failed:", error);
    }
  };

  const readyDocs = documents?.filter((d) => d.status === "ready") || [];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-page-title text-primary">Compare Documents</h1>
              <p className="text-text-secondary mt-1">
                Semantically compare two document versions to detect meaningful changes.
              </p>
            </div>

            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label mb-2 block">Version A</label>
                  <select
                    value={docA}
                    onChange={(e) => setDocA(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select document...</option>
                    {readyDocs.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.filename}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label mb-2 block">Version B</label>
                  <select
                    value={docB}
                    onChange={(e) => setDocB(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select document...</option>
                    {readyDocs.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.filename}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                className="btn-primary mt-4"
                onClick={handleCompare}
                disabled={!docA || !docB || compareMutation.isPending || docA === docB}
              >
                {compareMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <GitCompare className="h-4 w-4 mr-2" />
                )}
                Compare Documents
              </Button>

              {docA === docB && docA && (
                <p className="text-xs text-risk-medium mt-2">
                  Please select two different documents to compare.
                </p>
              )}
            </div>

            {readyDocs.length < 2 && (
              <div className="card text-center py-8">
                <FileText className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-card-title font-semibold text-primary mb-2">
                  Need at least 2 processed documents
                </h3>
                <p className="text-sm text-text-secondary">
                  Upload and process at least two documents to compare them.
                </p>
              </div>
            )}

            {compareMutation.isPending && (
              <div className="card text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
                <p className="text-text-secondary">Comparing documents...</p>
                <p className="text-xs text-text-muted mt-1">
                  Performing semantic alignment and change detection
                </p>
              </div>
            )}

            {result && result.changes && result.changes.length > 0 && (
              <div>
                <h2 className="text-section-title font-semibold text-primary mb-4">
                  Changes Detected
                </h2>
                <ComparisonView changes={result.changes} />
              </div>
            )}

            {result && result.changes && result.changes.length === 0 && (
              <div className="card text-center py-12">
                <GitCompare className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-card-title font-semibold text-primary mb-2">
                  No significant changes
                </h3>
                <p className="text-sm text-text-secondary">
                  The semantic comparison did not detect meaningful differences.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
