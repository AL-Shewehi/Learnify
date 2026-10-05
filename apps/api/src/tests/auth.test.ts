import { describe, expect, it } from "vitest";
import { BASE, guest, signup, session, uniqueEmail } from "./helpers";

describe("Auth", () => {
  it("rejects an invalid signup payload", async () => {
    const res = await guest().post(`${BASE}/auth/signup`).send({
      email: "invalid-email",
      password: "short",
    });

    expect(res.status).toBe(400);
  });

  it("signs up and sets an HttpOnly cookie", async () => {
    const res = await signup(session());
    expect(res.status).toBe(201);

    const cookie = String(res.headers["set-cookie"]?.[0] ?? "");
    expect(cookie).toContain("learnify_token");
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it("rejects a wrong password on login", async () => {
    const agent = session();
    const email = uniqueEmail();
    await signup(agent, { email });

    const res = await agent.post(`${BASE}/auth/login`).send({
        email,
        password: "wrong-password",
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 on /me without a session", async () => {
    const res = await guest().get(`${BASE}/auth/me`);
    expect(res.status).toBe(401);
  });

  it("returns the current user with a valid session", async () => {
    const agent = session();
    const signupRes = await signup(agent);
    const email = signupRes.body.data.user.email;

    const res = await agent.get(`${BASE}/auth/me`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
  });
});
