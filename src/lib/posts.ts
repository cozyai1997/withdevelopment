import type { Board, Post } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listPublishedPosts(board?: Board, limit?: number): Promise<Post[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (board) {
    query = query.eq("board", board);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getPublishedPost(board: Board, slug: string): Promise<Post | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("board", board)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export async function listAdminPosts(): Promise<Post[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getAdminPost(id: string): Promise<Post | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();

  if (error) {
    return null;
  }

  return data;
}
