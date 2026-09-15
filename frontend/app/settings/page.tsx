"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { Shield, AlertTriangle } from "lucide-react";

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
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-page-title text-primary">Settings</h1>
              <p className="text-text-secondary mt-1">
                Account and application settings.
              </p>
            </div>

            <div className="card">
              <h3 className="text-card-title font-semibold text-primary mb-4">
                Account
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Email</label>
                  <p className="text-sm text-text-primary">{user.email}</p>
                </div>
                <div>
                  <label className="label">User ID</label>
                  <p className="text-sm text-text-muted font-mono">{user.user_id}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-risk-low" />
                <h3 className="text-card-title font-semibold text-primary">
                  Security
                </h3>
              </div>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>Authentication is handled by Supabase Auth.</p>
                <p>All documents are stored in private storage buckets.</p>
                <p>Row Level Security (RLS) ensures users can only access their own data.</p>
              </div>
            </div>

            <div className="card border-risk-medium/30">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-risk-medium" />
                <h3 className="text-card-title font-semibold text-primary">
                  Legal Disclaimer
                </h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                This platform provides legal information and document analysis for assistance
                and educational purposes. It does not provide formal legal advice, does not
                replace a qualified legal professional, and does not create an attorney-client
                relationship.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
