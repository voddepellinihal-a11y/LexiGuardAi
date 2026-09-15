"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Scale, FileText, Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">LexiGuard AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="btn-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-page-title text-primary mb-4">
            Understand Your Legal Documents
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            AI-powered contract intelligence that transforms complex legal documents
            into role-aware risk insights, plain-English explanations, and actionable
            guidance for professional review.
          </p>
          <Link href="/signup">
            <Button className="btn-primary text-base px-8 py-3">
              Start Analyzing Documents
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Document Intelligence"
            description="Upload contracts, NDAs, leases, and more. Our AI extracts clauses, identifies risks, and explains terms in plain English."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Risk Analysis"
            description="Get a 0-100 risk score with detailed findings. Understand unlimited liability, indemnification, auto-renewal, and other critical clauses."
          />
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Document Q&A"
            description="Ask questions about your documents and get grounded answers with source citations. Never fabricate information."
          />
        </div>

        <div className="mt-16 card text-center">
          <p className="text-sm text-text-muted leading-relaxed max-w-2xl mx-auto">
            This platform provides legal information and document analysis for assistance and educational purposes.
            It does not provide formal legal advice, does not replace a qualified legal professional,
            and does not create an attorney-client relationship.
          </p>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-card-title font-semibold text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}
