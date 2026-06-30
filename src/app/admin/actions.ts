"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { readString } from "@/lib/validation";

function loginRedirect(message: string): never {
  redirect(`/admin/login?message=${encodeURIComponent(message)}`);
}

async function requireSupabaseForLogin(): Promise<NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    loginRedirect("Supabase 환경변수를 먼저 설정해 주세요.");
  }

  return supabase;
}

export async function signIn(formData: FormData) {
  const supabase = await requireSupabaseForLogin();
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  if (!email || !password) {
    loginRedirect("이메일과 비밀번호를 입력해 주세요.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    loginRedirect("로그인 정보를 확인해 주세요.");
  }

  redirect("/admin");
}

export async function signUp(formData: FormData) {
  const supabase = await requireSupabaseForLogin();
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  if (!email || password.length < 8) {
    loginRedirect("이메일과 8자 이상의 비밀번호를 입력해 주세요.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/admin/login`,
    },
  });

  if (error) {
    loginRedirect("가입 요청을 처리하지 못했습니다.");
  }

  loginRedirect("가입 요청이 접수되었습니다. 관리자 승인 후 사용할 수 있습니다.");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}
