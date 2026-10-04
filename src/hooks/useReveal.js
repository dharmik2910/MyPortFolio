import { useEffect } from "react";

const SELECTOR = "[data-reveal]:not(.is-in)";

// Adds `is-in` to every [data-reveal] element as it enters the viewport.
// Elements can set `--d` (delay, ms) via style for staggering.
// Elements rendered later (e.g. projects loaded from the API) are picked up too.
const useReveal = () => {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      const revealAll = () => document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add("is-in"));
      revealAll();
      const mo = new MutationObserver(revealAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    const observeAll = () => document.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    observeAll();

    // Observing an already-observed element is a no-op, so re-scanning on DOM changes is safe.
    const mo = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length)) observeAll();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
};

export default useReveal;
