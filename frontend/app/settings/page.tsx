"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { Shield, AlertTriangle } from "lucide-react";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-page-title text-primary">Settings</h1>
              <p className="text-text-secondary mt-1">
                Account and application settings.
              </p>
            </div>

            <div className="card">
              <h2 className="text-card-title font-semibold text-primary mb-4">
                Account
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="label">Email</span>
                  <p className="text-sm text-text-primary">{user.email}</p>
                </div>
                <div>
                  <span className="label">User ID</span>
                  <p className="text-sm text-text-muted font-mono">{user.user_id}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Shield aria-hidden="true" className="h-5 w-5 text-risk-low" />
                <h2 className="text-card-title font-semibold text-primary">
                  Security
                </h2>
              </div>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>Authentication is handled by Supabase Auth.</p>
                <p>All documents are stored in private storage buckets.</p>
                <p>Row Level Security (RLS) ensures users can only access their own data.</p>
              </div>
            </div>

            <div className="card border-risk-medium/30">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle aria-hidden="true" className="h-5 w-5 text-risk-medium" />
                <h2 className="text-card-title font-semibold text-primary">
                  Legal Disclaimer
                </h2>
              </div>
              <LegalDisclaimer className="text-sm text-text-secondary" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
