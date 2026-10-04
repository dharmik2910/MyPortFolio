import React, { useEffect, useState } from "react";
import { prefersReducedMotion } from "../lib/scroll";

const DURATION = 1800;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const Preloader = ({ onDone }) => {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      onDone();
      setGone(true);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / DURATION, 1);
      setCount(Math.round(easeOutQuart(t) * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setLeaving(true);
          onDone();
        }, 250);
        setTimeout(() => setGone(true), 1400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[90] flex flex-col justify-between bg-ink-800 p-6 transition-transform duration-[1100ms] ease-expo md:p-10 ${
        leaving ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ borderBottomLeftRadius: leaving ? "50% 12vh" : 0, borderBottomRightRadius: leaving ? "50% 12vh" : 0 }}
    >
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-cream-dim">
        <span>Dharmik Rabadiya</span>
        <span>Portfolio &copy; {new Date().getFullYear()}</span>
      </div>

      <div className="overflow-hidden">
        <p
          className={`font-display text-[22vw] font-extrabold leading-[0.8] tracking-tighter text-cream transition-transform duration-700 ease-expo md:text-[16vw] ${
            leaving ? "-translate-y-full" : ""
          }`}
        >
          {count}
          <span className="text-ember">%</span>
        </p>
      </div>

      <div className="h-px w-full bg-cream/10">
        <div
          className="h-full origin-left bg-ember"
          style={{ transform: `scaleX(${count / 100})` }}
        />
      </div>
    </div>
  );
};

export default Preloader;
