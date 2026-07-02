import type { Board, Post, PostImage, PostWithImages } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isLocalMockMode } from "@/lib/local-mock-mode";
import { localMockStore } from "@/lib/local-mock-store";

type PostRowWithImages = Post & {
  post_images?: PostImage[] | null;
};

function withImages(post: PostRowWithImages): PostWithImages {
  const { post_images, ...rest } = post;
  const images = [...(post_images ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
  return {
    ...rest,
    images,
  };
}

function getSlugCandidates(slug: string) {
  const candidates = [slug];

  try {
    const decodedSlug = decodeURIComponent(slug);

    if (decodedSlug !== slug) {
      candidates.push(decodedSlug);
    }
  } catch {
    // Keep the original slug when the URL segment is not URI-encoded.
  }

  return candidates;
}

export async function listPublishedPosts(board?: Board, limit?: number): Promise<PostWithImages[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return isLocalMockMode() ? localMockStore.listPublishedPosts(board, limit) : [];
  }

  let query = supabase
    .from("posts")
    .select("*, post_images(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "post_images", ascending: true })
    .order("created_at", { referencedTable: "post_images", ascending: true });

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

  return ((data ?? []) as PostRowWithImages[]).map(withImages);
}

export async function getPublishedPost(board: Board, slug: string): Promise<PostWithImages | null> {
  const supabase = await createSupabaseServerClient();
  const slugCandidates = getSlugCandidates(slug);

  if (!supabase) {
    if (!isLocalMockMode()) {
      return null;
    }

    for (const candidate of slugCandidates) {
      const post = await localMockStore.getPublishedPost(board, candidate);

      if (post) {
        return post;
      }
    }

    return null;
  }

  let lastError = false;

  for (const candidate of slugCandidates) {
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_images(*)")
      .eq("board", board)
      .eq("slug", candidate)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      lastError = true;
      continue;
    }

    if (data) {
      return withImages(data as PostRowWithImages);
    }
  }

  if (lastError && isLocalMockMode()) {
    for (const candidate of slugCandidates) {
      const post = await localMockStore.getPublishedPost(board, candidate);

      if (post) {
        return post;
      }
    }
  }

  return null;
}

export async function listAdminPosts(): Promise<PostWithImages[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return isLocalMockMode() ? localMockStore.listAdminPosts() : [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*, post_images(*)")
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return ((data ?? []) as PostRowWithImages[]).map(withImages);
}

export async function getAdminPost(id: string): Promise<PostWithImages | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return isLocalMockMode() ? localMockStore.getAdminPost(id) : null;
  }

  const { data, error } = await supabase.from("posts").select("*, post_images(*)").eq("id", id).maybeSingle();

  if (error) {
    return null;
  }

  return data ? withImages(data as PostRowWithImages) : null;
}
