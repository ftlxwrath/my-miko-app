"use client";

import { type FormEvent, useState } from "react";
import {
  STORAGE_KEYS,
  makeId,
  useLocalStorageState,
  type TodoItem,
} from "../lib/storage";

export default function TodosPage() {
  const [todoText, setTodoText] = useState("");
  const [todos, setTodos] = useLocalStorageState<TodoItem[]>(
    STORAGE_KEYS.todos,
    []
  );

  const addTodo = (event: FormEvent) => {
    event.preventDefault();
    if (!todoText.trim()) {
      return;
    }
    setTodos((current) => [
      ...current,
      {
        id: makeId(),
        text: todoText.trim(),
        done: false,
        createdAt: Date.now(),
      },
    ]);
    setTodoText("");
  };

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const removeTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  };

  return (
    <main className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7b4c4c]">
          To-dos
        </span>
        <h1
          className="text-4xl font-semibold leading-tight text-[#2b1616] md:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Keep the tasks that matter most in view.
        </h1>
        <p className="max-w-2xl text-lg text-[#6f4a4a]">
          Tap any item to mark it done and keep your list tidy.
        </p>
      </header>

      <section className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(170,74,74,0.4)] backdrop-blur">
        <h2
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your checklist
        </h2>
        <p className="text-sm text-[#8a5e5e]">
          Add a task and check it off when you are ready.
        </p>
        <form className="mt-4 flex flex-col gap-3" onSubmit={addTodo}>
          <input
            className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d08b8b]"
            placeholder="Add a task"
            value={todoText}
            onChange={(event) => setTodoText(event.target.value)}
          />
          <button
            className="rounded-2xl bg-[#b34343] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a23b3b]"
            type="submit"
          >
            Add to-do
          </button>
        </form>
        <div className="mt-4 grid gap-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between rounded-2xl border border-[#f3e0e0] bg-white px-4 py-3 text-sm"
            >
              <button
                className={`flex items-center gap-3 text-left transition ${
                  todo.done ? "text-[#9d7a7a]" : "text-[#2b1616]"
                }`}
                type="button"
                onClick={() => toggleTodo(todo.id)}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    todo.done
                      ? "border-[#b34343] bg-[#b34343] text-white"
                      : "border-[#d08b8b]"
                  }`}
                >
                  {todo.done ? "x" : ""}
                </span>
                <span className={todo.done ? "line-through" : undefined}>
                  {todo.text}
                </span>
              </button>
              <button
              className="text-xs uppercase tracking-[0.2em] text-[#b06767]"
                type="button"
                onClick={() => removeTodo(todo.id)}
              >
                Remove
              </button>
            </div>
          ))}
          {!todos.length ? (
            <p className="rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-6 text-center text-sm text-[#8a5e5e]">
              Add a task and mark it done when ready.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
