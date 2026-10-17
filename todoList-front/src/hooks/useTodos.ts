import { useCallback, useEffect, useState } from "react"
import type { Todo, TodoStatus } from "@/types"
import { todosApi } from "@/lib/todosApi"

/**
 * Loads and mutates todos through the NestJS API (not localStorage), so data
 * lives in Postgres and survives a server restart. Every mutation calls the
 * API and then updates local state with the server's response, keeping the
 * frontend and backend models aligned ({ id, title, status }).
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTodos(await todosApi.list())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load todos")
    } finally {
      setLoading(false)
    }
  }, [])

  // Load the list once on mount.
  useEffect(() => {
    void refresh()
  }, [refresh])

  const addTodo = useCallback(async (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    try {
      const created = await todosApi.create(trimmed)
      setTodos((prev) => [...prev, created])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add todo")
    }
  }, [])

  const updateTodo = useCallback(async (id: number, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    try {
      const updated = await todosApi.update(id, { title: trimmed })
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update todo")
    }
  }, [])

  const setStatus = useCallback(async (id: number, status: TodoStatus) => {
    try {
      const updated = await todosApi.update(id, { status })
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status")
    }
  }, [])

  /** Toggle between DONE and TODO (the UI's "completed" checkbox). */
  const toggleTodo = useCallback(
    async (id: number) => {
      const current = todos.find((t) => t.id === id)
      if (!current) return
      await setStatus(id, current.status === "DONE" ? "TODO" : "DONE")
    },
    [todos, setStatus]
  )

  const deleteTodo = useCallback(async (id: number) => {
    try {
      await todosApi.remove(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete todo")
    }
  }, [])

  return {
    todos,
    loading,
    error,
    refresh,
    addTodo,
    updateTodo,
    setStatus,
    toggleTodo,
    deleteTodo,
  }
}
