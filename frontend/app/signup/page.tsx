"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Scale, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <main id="main-content" className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Scale aria-hidden="true" className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">LexiGuard AI</span>
          </div>
          <div className="card text-center">
            <h1 className="text-section-title font-semibold text-primary mb-4">
              Check Your Email
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>.
              Please check your email to verify your account.
            </p>
            <Link href="/login">
              <Button className="btn-primary">Go to Sign In</Button>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mt-6 text-center">
          <LegalDisclaimer />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Scale aria-hidden="true" className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">LexiGuard AI</span>
        </div>

        <div className="card">
          <h1 className="text-section-title font-semibold text-primary text-center mb-6">
            Create Account
          </h1>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label" htmlFor="displayName">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field mt-1"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-risk-high">{error}</p>
            )}

            <Button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Account
            </Button>
          </form>

          <p className="text-sm text-text-secondary text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="w-full max-w-md mt-6 text-center">
        <LegalDisclaimer />
      </div>
    </main>
  );
}
