import { loadSession, saveSession, clearSession } from "./session";

describe("session service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saveSession and loadSession roundtrip", () => {
    const session = { token: "abc", role: "customer" };

    saveSession(session);
    const loaded = loadSession();

    expect(loaded).toEqual(session);
  });

  test("clearSession removes persisted session", () => {
    saveSession({ token: "abc" });
    clearSession();

    expect(loadSession()).toBeNull();
  });

  test("loadSession returns null for invalid JSON", () => {
    localStorage.setItem("agrilink-session", "not-json");

    expect(loadSession()).toBeNull();
  });
});
