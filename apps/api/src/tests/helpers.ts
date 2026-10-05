import request, { Response } from "supertest";
import app from "../app";

// Create a new test session
export const session = () => request.agent(app);

// Create a new test session for an authenticated user
export const guest = () => request(app);

let counter = 0;
export const uniqueEmail = () => `user${counter++}_${Date.now()}@test.com`;

export const signup = async (
  agent: request.Agent,
  overrides: Record<string, unknown> = {},
): Promise<Response> =>
  agent.post(`${BASE}/auth/signup`).send({
    name: "Test User",
    email: uniqueEmail(),
    password: "password",
    ...overrides,
  });

export const BASE = "/api/v1";
