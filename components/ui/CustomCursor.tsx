"use client";
import React, { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(max-width: 1024px)").matches || window.matchMedia("(pointer: coarse)").matches) return;

    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0)`;
      if (followerRef.current) {
        // High-speed easing
        followerRef.current.animate({
          transform: `translate3d(${e.clientX - 20}px, ${e.clientY - 20}px, 0)`
        }, { duration: 100, fill: "forwards" });
      }
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('a, button, input, select, textarea'));
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleHover);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHover);
    };
  }, []);

  // hidden lg:block ensures it never appears on mobile
  return (
    <div className="hidden lg:block">
      <div ref={cursorRef} className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference" />
      <div ref={followerRef} className={`fixed top-0 left-0 border rounded-full pointer-events-none z-[9998] transition-colors duration-200 ${isHovering ? 'w-10 h-10 bg-crimson border-crimson mix-blend-normal' : 'w-10 h-10 border-white/30 mix-blend-difference'}`} />
    </div>
  );
}