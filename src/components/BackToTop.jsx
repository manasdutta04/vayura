"use client";

import { useEffect } from "react";

const scrollToTop = () => {
  const scrollContainer = document.querySelector("main") || window;
  scrollContainer.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export default function BackToTop() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Trigger the "Back to Top" command via keyboard shortcuts
      // We check if the user is typing in a form field to avoid accidental triggers
      const isTyping = /^(?:input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
      
      if (!isTyping && (e.key === "Home" || (e.altKey && e.key.toLowerCase() === "t"))) {
        scrollToTop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full
                 bg-gradient-to-br from-blue-900 to-blue-600
                 text-white text-xl shadow-lg transition-all duration-300 ease-in-out
                 hover:scale-110 active:scale-95"
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
