import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("next config", () => {
  it("allows case image uploads through server actions", () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe("60mb");
  });
});
