"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [followerPosition, setFollowerPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide cursor on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setTimeout(() => {
        setFollowerPosition({ x: e.clientX, y: e.clientY });
      }, 50);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'A' || target.tagName.toLowerCase() === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [pathname]);

  if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference transition-all duration-300"
        style={{ transform: `translate(${position.x - 6}px, ${position.y - 6}px)` }}
      />
      <div 
        className={`fixed top-0 left-0 border border-white/30 rounded-full pointer-events-none z-[9998] transition-all duration-100 ease-out ${isHovering ? 'w-10 h-10 bg-crimson border-crimson mix-blend-normal' : 'w-10 h-10 mix-blend-difference'}`}
        style={{ 
          transform: `translate(${followerPosition.x - (isHovering ? 20 : 20)}px, ${followerPosition.y - (isHovering ? 20 : 20)}px)`,
        }}
      />
    </>
  );
}