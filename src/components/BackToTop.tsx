"use client";

import { useEffect, useState } from "react";

const scrollToTop = () => {
  const scrollContainer = document.querySelector("main") || window;
  scrollContainer.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200); // 👈 show only after scrolling
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        /^(?:input|textarea|select)$/i.test(target.tagName) ||
        target.isContentEditable;

      if (
        !isTyping &&
        (e.key === "Home" || (e.altKey && e.key.toLowerCase() === "t"))
      ) {
        scrollToTop();
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!visible) return null; // 👈 hide completely

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Back to top"
      title="Back to top"
      className="
        fixed bottom-6 right-6 z-50
        flex h-11 w-11 items-center justify-center rounded-full
        bg-background/80 backdrop-blur
        border border-border
        text-foreground
        shadow-lg
        transition-all duration-300
        hover:scale-110 hover:shadow-xl
        active:scale-95
      "
    >
      <span aria-hidden="true" className="text-lg">
        ↑
      </span>
    </button>
  );
}
