import { readFile } from "node:fs/promises";
import { localMockStore } from "@/lib/local-mock-store";
import { isLocalMockMode } from "@/lib/local-mock-mode";

type MockAssetRouteProps = {
  params: Promise<{ path: string[] }>;
};

function contentType(filePath: string) {
  const lower = filePath.toLowerCase();

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  return "image/jpeg";
}

export async function GET(_request: Request, { params }: MockAssetRouteProps) {
  if (!isLocalMockMode()) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { path } = await params;
    const filePath = localMockStore.resolveCaseImageAssetPath(path);
    const file = await readFile(filePath);

    return new Response(new Uint8Array(file), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": contentType(filePath),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
