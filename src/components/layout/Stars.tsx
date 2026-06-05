"use client";

import { useEffect, useRef } from "react";

export default function Stars({ count = 80 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      const size = Math.random() * 1.8 + 0.5;
      star.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        border-radius:50%;background:white;
        left:${Math.random() * 100}%;top:${Math.random() * 100}%;
        opacity:${Math.random() * 0.6 + 0.1};
        animation:twinkle ${Math.random() * 3 + 1.5}s ease-in-out infinite;
        animation-delay:${Math.random() * 4}s;
        pointer-events:none;
      `;
      el.appendChild(star);
    }
  }, [count]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
