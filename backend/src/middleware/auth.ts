import jwt from "jsonwebtoken";
import { dbPromise } from "../database/config";

const JWT_SECRET =
  process.env.JWT_SECRET || "default_jwt_secret_change_in_production";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export async function getAuthUser(token: string): Promise<AuthUser | null> {
  if (!token) return null;

  try {
    // Verify token and extract user data
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Optionally fetch additional user data from DB if needed
    const db = await dbPromise;
    const user = await db.get(
      "SELECT id, email, role FROM users WHERE id = ?",
      [decoded.id]
    );

    return user
      ? { id: user.id + "", email: user.email, role: user.role }
      : null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}
