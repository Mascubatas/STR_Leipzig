import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { ensureNeonTables } from "@/db/bootstrap";
import { getDatabaseUrl } from "@/db/connection";

const AUTH_SECRET = process.env.AUTH_SECRET || "leipzig_stay_secure_jwt_secret_dev_key_32_chars";
const COOKIE_NAME = "leipzig_stay_session";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: "GUEST" | "ADMIN";
}

// In-memory user directory (synchronized with seeded DB)
interface StoredUser extends SessionUser {
  passwordHash: string;
}

const memoryUsers: Map<string, StoredUser> = new Map();

// Initialize default admin and guest
async function initDefaultUsers() {
  if (memoryUsers.size === 0) {
    const adminHash = await bcrypt.hash("LeipzigAdmin2026!", 10);
    memoryUsers.set("admin@leipzigstay.de", {
      id: "admin-user-001",
      email: "admin@leipzigstay.de",
      fullName: "LeipzigStay Property Management",
      role: "ADMIN",
      passwordHash: adminHash,
    });

    const guestHash = await bcrypt.hash("GuestPassword2026!", 10);
    memoryUsers.set("guest@example.com", {
      id: "guest-user-001",
      email: "guest@example.com",
      fullName: "Dr. Clara Schumann",
      role: "GUEST",
      passwordHash: guestHash,
    });
  }
}
initDefaultUsers();

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    AUTH_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as SessionUser;
    return {
      id: decoded.id,
      email: decoded.email,
      fullName: decoded.fullName,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export async function registerUser(email: string, password: string, fullName: string, role: "GUEST" | "ADMIN" = "GUEST"): Promise<SessionUser> {
  await initDefaultUsers();
  const normalized = email.toLowerCase().trim();

  // Check Neon DB for existing user
  try {
    const dbUrl = getDatabaseUrl();
    if (dbUrl) {
      await ensureNeonTables();
      const sql = neon(dbUrl);
      const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${normalized} LIMIT 1;`;
      if (existing.length > 0) {
        throw new Error("An account with this email address already exists.");
      }
    }
  } catch (err) {
    if ((err as Error).message.includes("already exists")) {
      throw err;
    }
  }

  if (memoryUsers.has(normalized)) {
    throw new Error("An account with this email address already exists.");
  }

  const passwordHash = await hashPassword(password);
  const newUser: StoredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: normalized,
    fullName,
    role,
    passwordHash,
  };
  memoryUsers.set(normalized, newUser);

  // Persist to Neon
  try {
    const dbUrl = getDatabaseUrl();
    if (dbUrl) {
      const sql = neon(dbUrl);
      await sql`
        INSERT INTO users (id, email, full_name, role, password_hash)
        VALUES (gen_random_uuid(), ${normalized}, ${fullName}, ${role}, ${passwordHash})
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash;
      `;
    }
  } catch (err) {
    console.warn("Neon user save notice:", err);
  }

  return { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role };
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  await initDefaultUsers();
  const normalized = email.toLowerCase().trim();

  let user = memoryUsers.get(normalized);

  // Look up in Neon if not in memory
  if (!user) {
    try {
      const dbUrl = getDatabaseUrl();
      if (dbUrl) {
        await ensureNeonTables();
        const sql = neon(dbUrl);
        const rows = await sql`
          SELECT id, email, full_name, role, password_hash FROM users WHERE LOWER(email) = ${normalized} LIMIT 1;
        `;
        if (rows.length > 0) {
          const row = rows[0];
          user = {
            id: String(row.id),
            email: String(row.email),
            fullName: String(row.full_name),
            role: row.role as "GUEST" | "ADMIN",
            passwordHash: String(row.password_hash),
          };
          memoryUsers.set(normalized, user);
        }
      }
    } catch (err) {
      console.warn("Neon user lookup notice:", err);
    }
  }

  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };
