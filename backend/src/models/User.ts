export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}
