import { getSession } from "next-auth/react";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getSession();

  if (!session) throw new Error("No active session");

  // token berasal dari session.user.token
  const token = session.user?.token;
  if (!token) throw new Error("No token provider");

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return res;
}
