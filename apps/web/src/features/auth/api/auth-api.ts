import { api } from "@/lib/api";
import type {
  AuthResponse,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
  UserResponse,
} from "@learnify/shared";

export const authApi = {
  login: (input: LoginInput): Promise<UserResponse> =>
    api.post<AuthResponse>("/auth/login", input).then((r) => r.data.data.user),

  signup: (input: SignupInput): Promise<UserResponse> =>
    api.post<AuthResponse>("/auth/signup", input).then((r) => r.data.data.user),
  forgotPassword: (input: ForgotPasswordInput): Promise<void> =>
    api.post("/auth/forgot-password", input).then(() => undefined),
  resetPassword: (
    token: string,
    input: ResetPasswordInput,
  ): Promise<UserResponse> =>
    api
      .post<AuthResponse>(`/auth/reset-password/${token}`, input)
      .then((r) => r.data.data.user),
  me: (): Promise<UserResponse> =>
    api.get<AuthResponse>("/auth/me").then((r) => r.data.data.user),
  logout: (): Promise<void> => api.post("/auth/logout").then(() => undefined),
};
