import { useEffect, useRef, useState } from "react"
import { Check, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "cn"
import type { Todo } from "@/types"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, title: string) => void
}

const STATUS_LABEL: Record<Todo["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const isDone = todo.status === "DONE"

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const startEdit = () => {
    setDraft(todo.title)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setDraft(todo.title)
    setIsEditing(false)
  }

  const commitEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, trimmed)
    }
    setIsEditing(false)
  }

  return (
    <li
      className={cn(
        "group animate-todo-in flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur transition-colors",
        "hover:border-accent/70"
      )}
    >
      {isEditing ? (
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            commitEdit()
          }}
        >
          <Input
            ref={inputRef}
            value={draft}
            onValueChange={(value) => setDraft(value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancelEdit()
            }}
          />
          <Button type="submit" size="icon-sm" aria-label="Save">
            <Check />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={cancelEdit}
            aria-label="Cancel"
          >
            <X />
          </Button>
        </form>
      ) : (
        <>
          <Checkbox
            checked={isDone}
            onCheckedChange={() => onToggle(todo.id)}
            aria-label={isDone ? "Mark as not done" : "Mark as done"}
          />

          <button
            type="button"
            onClick={() => onToggle(todo.id)}
            className="flex flex-1 flex-col items-start gap-1 text-left"
          >
            <span
              className={cn(
                "text-sm transition-colors sm:text-base",
                isDone
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              )}
            >
              {todo.title}
            </span>
            <span className="inline-flex items-center rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
              {STATUS_LABEL[todo.status]}
            </span>
          </button>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={startEdit}
              aria-label="Edit task"
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="hover:text-destructive"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete task"
            >
              <Trash2 />
            </Button>
          </div>
        </>
      )}
    </li>
  )
}
