export const CASE_IMAGE_BUCKET = "case-images";
export const CASE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const CASE_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"] as const;

type FileLike = {
  type: string;
  size: number;
};

export function isAllowedCaseImageFile(file: FileLike) {
  return CASE_IMAGE_MIME_TYPES.includes(file.type as (typeof CASE_IMAGE_MIME_TYPES)[number]) && file.size <= CASE_IMAGE_MAX_BYTES;
}

export function normalizeCaseImageFileName(name: string) {
  const trimmed = name.trim().toLowerCase();
  const dotIndex = trimmed.lastIndexOf(".");
  const extension = dotIndex >= 0 ? trimmed.slice(dotIndex + 1) : "jpg";
  const basename = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed;
  const safeExtension = extension === "jpeg" ? "jpg" : extension === "png" ? "png" : "jpg";
  const safeBase =
    basename
      .normalize("NFC")
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "case-image";

  return `${safeBase}.${safeExtension}`;
}

export function getCaseImagePublicUrl(storagePath: string | null | undefined, supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (!storagePath) {
    return null;
  }

  const encodedPath = storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  if (storagePath.startsWith("mock/")) {
    return `/${encodedPath.replace(/^mock\//, "mock-assets/")}`;
  }

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${CASE_IMAGE_BUCKET}/${encodedPath}`;
}
