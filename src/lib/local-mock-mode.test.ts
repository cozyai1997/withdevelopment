import { describe, expect, it } from "vitest";
import { isLocalMockModeForEnv } from "./local-mock-mode";

describe("local mock mode", () => {
  it("is enabled only outside production when Supabase is not configured", () => {
    expect(isLocalMockModeForEnv({ nodeEnv: "development", supabaseUrl: "", supabaseAnonKey: "" })).toBe(true);
    expect(isLocalMockModeForEnv({ nodeEnv: "test", supabaseUrl: undefined, supabaseAnonKey: undefined })).toBe(true);
    expect(isLocalMockModeForEnv({ nodeEnv: "development", supabaseUrl: "https://example.supabase.co", supabaseAnonKey: "" })).toBe(true);
    expect(isLocalMockModeForEnv({ nodeEnv: "production", supabaseUrl: "", supabaseAnonKey: "" })).toBe(false);
    expect(
      isLocalMockModeForEnv({
        nodeEnv: "development",
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
      }),
    ).toBe(false);
  });
});
