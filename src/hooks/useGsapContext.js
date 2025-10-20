// src/hooks/useGsapContext.js
import { useLayoutEffect, useRef } from "react";
import { setupGsap, gsap } from "../lib/gsap/setupGsap";

/**
 * Hook corto para crear un gsap.context y limpiarlo al desmontar.
 * Retorna {ref, ctx} donde `ref` es el root para scoping (opcional).
 */
export function useGsapContext() {
  setupGsap();
  const rootRef = useRef(null);
  const ctxRef = useRef(null);

  useLayoutEffect(() => {
    ctxRef.current = gsap.context(() => {}, rootRef);
    return () => ctxRef.current && ctxRef.current.revert();
  }, []);

  return { ref: rootRef, ctx: ctxRef };
}
