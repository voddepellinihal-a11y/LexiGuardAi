"use client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = () => {
  return supabaseUrl && supabaseKey && supabaseUrl !== "https://placeholder.supabase.co";
};

// Safe mock client for when Supabase is not configured
const mockAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
  signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
};

const mockClient = {
  auth: mockAuth,
  from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) }),
  storage: { from: () => ({ upload: () => ({ data: null, error: null }) }) },
};

let client: any = null;

export function createClient() {
  if (client) return client;

  if (!isConfigured()) {
    client = mockClient;
    return client;
  }

  // Dynamic import to avoid crash when env vars are missing
  try {
    const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
    client = createSupabaseClient(supabaseUrl, supabaseKey);
  } catch {
    client = mockClient;
  }
  return client;
}
