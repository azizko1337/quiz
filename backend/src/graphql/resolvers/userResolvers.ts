import { dbPromise } from "../../database/config";
import {
  checkAuthenticated,
  checkAdmin,
  AuthorizationError,
} from "../../utils/auth";

export const userQueries = {
  users: async (_: any, __: any, { authUser }: any) => {
    checkAuthenticated(authUser);

    const db = await dbPromise;
    if (authUser.role !== "ADMIN") {
      return db.all(
        "SELECT id, username FROM users WHERE role != 'ADMIN' AND id != ?",
        [authUser.id]
      );
    } else {
      return db.all(
        "SELECT id, username, role, email, createdAt FROM users WHERE id != ?",
        [authUser.id]
      );
    }
  },
  user: async (_: any, { id }: any, { authUser }: any) => {
    const authenticatedUser = checkAuthenticated(authUser);

    const db = await dbPromise;
    const user = await db.get(
      "SELECT id, username, email, role, created_at as createdAt FROM users WHERE id = ?",
      [id]
    );

    if (!user) return null;

    if (authenticatedUser.id === id || authenticatedUser.role === "ADMIN") {
      return user;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  },
};

export const userMutations = {
  createUser: async (
    _: any,
    { username, email, password, role }: any,
    { authUser }: any
  ) => {
    // Only admins can create users with specific roles
    if (role && role === "ADMIN") {
      // Check if authenticated user is admin
      if (authUser) {
        checkAdmin(authUser);
      } else {
        throw new AuthorizationError(
          "Admin privileges required to create admin users"
        );
      }
    }

    const userRole = role || "USER";

    const db = await dbPromise;
    const result = await db.run(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, password, userRole]
    );

    return {
      id: result.lastID,
      username,
      email,
      role: userRole,
      createdAt: new Date().toISOString(),
    };
  },
  updateUser: async (
    _: any,
    { id, username, email, role }: any,
    { authUser }: any
  ) => {
    const user = checkAuthenticated(authUser);

    // Allow role changes only for admins
    if (role && user.role !== "ADMIN") {
      throw new AuthorizationError("Admin privileges required to change roles");
    }

    // Allow updates only for own account or if admin
    if (user.id !== id && user.role !== "ADMIN") {
      throw new AuthorizationError("You can only update your own account");
    }

    const db = await dbPromise;
    const updates: string[] = [];
    const params: string[] = [];

    if (username) {
      updates.push("username = ?");
      params.push(username);
    }

    if (email) {
      updates.push("email = ?");
      params.push(email);
    }

    if (role) {
      updates.push("role = ?");
      params.push(role);
    }

    if (updates.length > 0) {
      params.push(id);
      await db.run(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        params
      );
    }

    return db.get(
      "SELECT id, username, email, role, created_at as createdAt FROM users WHERE id = ?",
      [id]
    );
  },
  deleteUser: async (_: any, { id }: any, { authUser }: any) => {
    const user = checkAuthenticated(authUser);

    if (user.id !== id && user.role !== "ADMIN") {
      throw new AuthorizationError("You can only delete your own account");
    }

    const db = await dbPromise;
    const result = await db.run("DELETE FROM users WHERE id = ?", [id]);
    if (!result.changes) return false;
    return result.changes > 0;
  },
};
