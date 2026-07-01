import { describe, expect, it } from "vitest";
import {
  TEMP_ADMIN_COOKIE,
  TEMP_ADMIN_ID,
  TEMP_ADMIN_PASSWORD,
  getTempAdminCookieValue,
  getTempAdminProfile,
  isTempAdminCredentials,
  isTempAdminSession,
} from "./temp-admin";

describe("temporary admin credentials", () => {
  it("accepts the requested temporary admin id and password", () => {
    expect(TEMP_ADMIN_COOKIE).toBe("withdevelopment-temp-admin");
    expect(TEMP_ADMIN_ID).toBe("admin");
    expect(TEMP_ADMIN_PASSWORD).toBe("1234");
    expect(isTempAdminCredentials(" admin ", "1234")).toBe(true);
  });

  it("rejects wrong temporary admin credentials", () => {
    expect(isTempAdminCredentials("admin", "wrong")).toBe(false);
    expect(isTempAdminCredentials("user", "1234")).toBe(false);
  });

  it("recognizes only the generated temporary admin session cookie value", () => {
    const cookieValue = getTempAdminCookieValue();

    expect(cookieValue).not.toBe("1234");
    expect(isTempAdminSession(cookieValue)).toBe(true);
    expect(isTempAdminSession("1234")).toBe(false);
  });

  it("builds an admin profile for the temporary account", () => {
    expect(getTempAdminProfile()).toMatchObject({
      id: "temp-admin",
      email: "admin",
      role: "admin",
    });
  });
});
