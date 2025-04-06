import { dbPromise } from "../../database/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET =
  process.env.JWT_SECRET || "default_jwt_secret_change_in_production";

export const authMutations = {
  login: async (_: any, { email, password }: any, context: any) => {
    const db = await dbPromise;

    // Find user by email
    const user = await db.get(
      "SELECT id, username, email, password, role, created_at as createdAt FROM users WHERE email = ?",
      [email]
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Check if passwords match
    // In a real app, you should use bcrypt to hash and compare passwords
    // For simplicity, we're doing a direct comparison here
    // const validPassword = await bcrypt.compare(password, user.password);
    const validPassword = user.password === password; // Replace with proper hashing in production

    if (!validPassword) {
      throw new Error("Invalid password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Add token to response headers
    if (context.res) {
      context.res.setHeader("Authorization", `Bearer ${token}`);
    }

    // Return user without password
    const { password: HIDDEN, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  logout: async (_: any, __: any, context: any) => {
    if (context.res) {
      context.res.setHeader("Authorization", "");
    }
    return true;
  },
};
