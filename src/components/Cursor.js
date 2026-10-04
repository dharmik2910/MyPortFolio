import React, { useEffect, useRef } from "react";
import { isTouchDevice, prefersReducedMotion } from "../lib/scroll";

// Dot follows the pointer exactly; ring trails behind with easing.
// Elements with [data-cursor="Label"] turn the ring into a labelled disc.
const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor", "cursor-hidden");

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      root.classList.remove("cursor-hidden");
    };
    const onLeave = () => root.classList.add("cursor-hidden");

    const onOver = (e) => {
      const ringEl = ringRef.current;
      if (!ringEl) return;
      const labelled = e.target.closest("[data-cursor]");
      const interactive = e.target.closest("a, button, input, textarea, [role='button']");
      if (labelled) {
        labelRef.current.textContent = labelled.dataset.cursor;
        ringEl.classList.add("is-label");
        ringEl.classList.remove("is-hover");
      } else if (interactive) {
        ringEl.classList.add("is-hover");
        ringEl.classList.remove("is-label");
      } else {
        ringEl.classList.remove("is-hover", "is-label");
      }
    };

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.18;
      ring.y += (pos.y - ring.y) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-custom-cursor", "cursor-hidden");
    };
  }, []);

  if (typeof window !== "undefined" && (isTouchDevice() || prefersReducedMotion())) {
    return null;
  }

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-ring__label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
};

export default Cursor;
