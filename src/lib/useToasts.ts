import { useCallback, useRef, useState } from "react";

export type ToastTone = "success" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
}

export interface ToastItem extends ToastInput {
  id: number;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((list) => [...list.slice(-2), { ...input, id }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
}
