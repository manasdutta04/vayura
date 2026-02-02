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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollPercent = docHeight ? scrollTop / docHeight : 0;

      setVisible(scrollTop > 200); // show button after scrolling 200px
      setProgress(scrollPercent);
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

  if (!visible) return null;

  // Circle parameters
  const radius = 28;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Back to top"
      title="Back to top"
      className="
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        h-14 w-14
        rounded-full
        bg-background/80 backdrop-blur
        border border-border
        shadow-lg
        hover:scale-110 hover:shadow-xl
        active:scale-95
        transition-all duration-300
      "
    >
      <svg
        className="absolute h-full w-full -rotate-90"
        viewBox="0 0 60 60"
      >
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span aria-hidden="true" className="text-lg z-10 relative">
        ↑
      </span>
    </button>
  );
}
