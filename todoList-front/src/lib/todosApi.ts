/**
 * Thin client for the NestJS todos API.
 *
 * The backend runs on http://localhost:3000 with a global "/api" prefix and
 * allows CORS from the Vite dev server (http://localhost:5173). See the
 * backend main.ts (setGlobalPrefix('api') + enableCors).
 */
import type { Todo, TodoStatus } from "@/types"

const API = "http://localhost:3000/api/todos"

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = ""
    try {
      const body = (await res.json()) as { message?: unknown }
      detail = Array.isArray(body.message)
        ? body.message.join(", ")
        : String(body.message ?? "")
    } catch {
      /* response had no JSON body (e.g. 204) */
    }
    throw new Error(`API ${res.status}${detail ? `: ${detail}` : ""}`)
  }
  // 204 No Content has an empty body.
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const todosApi = {
  list(): Promise<Todo[]> {
    return fetch(API).then((r) => handle<Todo[]>(r))
  },

  create(title: string): Promise<Todo> {
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: "TODO" }),
    }).then((r) => handle<Todo>(r))
  },

  update(
    id: number,
    patch: Partial<Pick<Todo, "title" | "status">>
  ): Promise<Todo> {
    return fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then((r) => handle<Todo>(r))
  },

  remove(id: number): Promise<void> {
    return fetch(`${API}/${id}`, { method: "DELETE" }).then((r) =>
      handle<void>(r)
    )
  },
}

export type { TodoStatus }
