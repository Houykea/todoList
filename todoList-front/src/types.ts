/**
 * Shared Todo model — kept in sync with the NestJS backend entity
 * (src/todos/entities/todo.entity.ts): { id: number, title: string, status }.
 */
export type TodoStatus = "TODO" | "IN_PROGRESS" | "DONE"

export interface Todo {
  id: number
  title: string
  status: TodoStatus
}

/** Status filter for the UI: "ALL" shows everything, otherwise a specific status. */
export type StatusFilter = "ALL" | TodoStatus
