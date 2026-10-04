import React, { useState, useEffect } from "react";
import { FiArrowUp } from "react-icons/fi";
import { scrollToSection } from "../lib/scroll";

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Back-to-top button whose ring fills with page scroll progress.
const ScrollToTopButton = () => {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
      setShowButton(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-ember"
        style={{ transform: `scaleX(${progress})` }}
      />
      <button
        onClick={() => scrollToSection("top")}
        aria-label="Scroll to top"
        tabIndex={showButton ? 0 : -1}
        className={`group fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-ink-800/80 text-cream backdrop-blur transition-all duration-500 ease-expo hover:bg-ember hover:text-ink ${
          showButton ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="28" cy="28" r={RADIUS} fill="none" style={{ stroke: "rgb(var(--c-cream) / 0.12)" }} strokeWidth="2" />
          <circle
            cx="28"
            cy="28"
            r={RADIUS}
            fill="none"
            stroke="#FF5823"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <FiArrowUp className="relative transition-transform duration-500 ease-expo group-hover:-translate-y-0.5" />
      </button>
    </>
  );
};

export default ScrollToTopButton;
