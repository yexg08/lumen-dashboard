import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

// cierra menus al hacer click fuera o al presionar escape
export function useDismiss(ref: RefObject<HTMLElement | null>, onDismiss: () => void, enabled: boolean) {
  const handler = useRef(onDismiss);
  useEffect(() => {
    handler.current = onDismiss;
  });

  useEffect(() => {
    if (!enabled) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) handler.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler.current();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, enabled]);
}
