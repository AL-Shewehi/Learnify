import { USER_ROLES } from "../constants/index.js";

export type UserRole = (typeof USER_ROLES)[number];

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  status: "success";
  token: string;
  data: { user: UserResponse };
}