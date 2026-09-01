import type { PlanId } from "./plans";

export const SESSION_KEY = "volta.session";
export const ACCOUNTS_KEY = "volta.accounts";

export interface Account {
  id: string;
  email: string;
  passHash: string;
  plan: PlanId;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  plan: PlanId;
}

function browser() {
  return typeof window !== "undefined";
}

async function sha(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPass(email: string, password: string) {
  return sha(`${email.toLowerCase()}::${password}::volta.v1`);
}

export function loadAccounts(): Account[] {
  if (!browser()) return [];
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAccounts(list: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

export function loadSession(): Session | null {
  if (!browser()) return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null) {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  document.cookie = session
    ? `volta_plan=${session.plan}; path=/; max-age=2592000; samesite=lax`
    : "volta_plan=; path=/; max-age=0";
}

export async function register(email: string, password: string, plan: PlanId = "free"): Promise<Session> {
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@") || password.length < 6) throw new Error("Use a real email and 6+ character password.");
  const accounts = loadAccounts();
  if (accounts.some((a) => a.email === clean)) throw new Error("That email already has a workspace.");
  const account: Account = {
    id: crypto.randomUUID(),
    email: clean,
    passHash: await hashPass(clean, password),
    plan,
    createdAt: new Date().toISOString(),
  };
  saveAccounts([account, ...accounts]);
  const session = { userId: account.id, email: clean, plan };
  saveSession(session);
  return session;
}

export async function login(email: string, password: string): Promise<Session> {
  const clean = email.trim().toLowerCase();
  const account = loadAccounts().find((a) => a.email === clean);
  if (!account) throw new Error("No workspace for that email.");
  if (account.passHash !== (await hashPass(clean, password))) throw new Error("Wrong password.");
  const session = { userId: account.id, email: clean, plan: account.plan };
  saveSession(session);
  return session;
}

export function logout() {
  saveSession(null);
}

export function setPlan(plan: PlanId) {
  const session = loadSession();
  if (!session) return;
  const accounts = loadAccounts().map((a) => (a.id === session.userId ? { ...a, plan } : a));
  saveAccounts(accounts);
  saveSession({ ...session, plan });
}

export function ns(userId: string | null | undefined, key: string) {
  return userId ? `volta.${userId}.${key}` : `volta.${key}`;
}
