"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/types";

const isConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url !== "https://placeholder.supabase.co";
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!isConfigured()) {
      setUser({ user_id: "demo-user-001", email: "demo@lexiguard.ai" });
      setLoading(false);
      return;
    }

    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            user_id: session.user.id,
            email: session.user.email,
          });
        }
      } catch (e) {
        // Supabase not configured
      }
      setLoading(false);
    };

    getUser();

    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const result = supabase.auth.onAuthStateChange(
        async (_event: string, session: { user?: { id: string; email?: string } } | null) => {
          if (session?.user) {
            setUser({
              user_id: session.user.id,
              email: session.user.email,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );
      subscription = result.data?.subscription;
    } catch (e) {
      // Supabase not configured
    }

    return () => subscription?.unsubscribe?.();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return { user, loading, signOut };
}
