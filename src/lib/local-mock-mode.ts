import { getSupabaseEnv } from "./supabase/config";

type LocalMockModeEnv = {
  nodeEnv?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export function isLocalMockModeForEnv({ nodeEnv, supabaseUrl, supabaseAnonKey }: LocalMockModeEnv) {
  return nodeEnv !== "production" && !(supabaseUrl && supabaseAnonKey);
}

export function isLocalMockMode() {
  const { url, anonKey } = getSupabaseEnv();
  return isLocalMockModeForEnv({
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
  });
}
