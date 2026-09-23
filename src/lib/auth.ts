import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
  return { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role };
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  await initDefaultUsers();
  const normalized = email.toLowerCase().trim();
  const user = memoryUsers.get(normalized);
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
