import { useMemo, useState } from "react"
import { Check, ListTodo, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TodoItem } from "@/components/TodoItem"
import { useTodos } from "@/hooks/useTodos"
import { cn } from "cn"
import type { StatusFilter } from "@/types"

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
]

export function TodoApp() {
  const {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  } = useTodos()

  const [title, setTitle] = useState("")
  const [filter, setFilter] = useState<StatusFilter>("ALL")

  const remaining = todos.filter((t) => t.status !== "DONE").length

  const visibleTodos = useMemo(() => {
    if (filter === "ALL") return todos
    return todos.filter((t) => t.status === filter)
  }, [todos, filter])

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    void addTodo(title)
    setTitle("")
  }

  return (
    <div className="w-full max-w-xl">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <ListTodo className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Things to do
          </h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : remaining === 0
                ? "All clear — nice work."
                : `${remaining} task${remaining === 1 ? "" : "s"} left`}
          </p>
        </div>
      </header>

      <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xl backdrop-blur-md">
        {/* ---- Add task ---- */}
        <form onSubmit={handleAddTask} className="flex items-center gap-2">
          <Input
            value={title}
            onValueChange={(value) => setTitle(value)}
            placeholder="Add a new task..."
            className="h-10"
            aria-label="New task title"
          />
          <Button
            type="submit"
            size="icon-lg"
            disabled={!title.trim()}
            aria-label="Add task"
          >
            <Plus />
          </Button>
        </form>

        {/* ---- Status filter bar ---- */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                filter === f.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ---- Error ---- */}
        {error && (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* ---- Task list ---- */}
        <ul className="mt-4 flex flex-col gap-2">
          {visibleTodos.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
              {loading
                ? "Loading tasks…"
                : filter === "ALL"
                  ? "No tasks yet. Add your first one above."
                  : "No tasks with this status."}
            </li>
          ) : (
            visibleTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
              />
            ))
          )}
        </ul>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
        <Check className="size-3" /> Saved in Postgres via the API · Press{" "}
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">d</kbd> to
        toggle theme
      </p>
    </div>
  )
}
