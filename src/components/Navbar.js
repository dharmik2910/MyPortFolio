import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import Navlinks from "../data/navlinks";
import { getLenis, scrollToSection } from "../lib/scroll";
import { useContent } from "../lib/ContentContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { profile: ProfileData, contact: ContactData } = useContent();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const linkRefs = useRef({});

  // Hide on scroll down, reveal on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > 300);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section is in view
  useEffect(() => {
    const sections = Navlinks.map((l) => document.getElementById(l.link)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Slide the pill highlight under the active link
  useLayoutEffect(() => {
    const update = () => {
      const el = linkRefs.current[active];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active]);

  // Freeze page scroll while the mobile menu is open
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) isMenuOpen ? lenis.stop() : lenis.start();
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  const go = (id) => {
    setIsMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-transform duration-700 ease-expo md:px-8 ${
          hidden && !isMenuOpen ? "-translate-y-[130%]" : "translate-y-0"
        }`}
      >
        <div className="hero-fade mx-auto flex max-w-7xl items-center justify-between" style={{ "--d": "900ms" }}>
          <button
            onClick={() => go("home")}
            className="group flex items-center gap-2 font-display text-xl font-bold tracking-tight text-cream"
            aria-label="Back to top"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ember text-sm text-ink transition-transform duration-500 ease-expo group-hover:rotate-[360deg]">
              DR
            </span>
            <span className="hidden sm:inline">
              Dharmik<span className="text-ember">.</span>
            </span>
          </button>

          <nav
            aria-label="Primary"
            className={`relative hidden items-center rounded-full border p-1.5 backdrop-blur-xl transition-colors duration-500 lg:flex ${
              scrolled ? "border-cream/10 bg-ink-800/70" : "border-cream/5 bg-ink-800/30"
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 rounded-full bg-cream transition-all duration-500 ease-expo"
              style={{ left: indicator.left, width: indicator.width }}
            />
            {Navlinks.map((item) => (
              <button
                key={item.link}
                ref={(el) => (linkRefs.current[item.link] = el)}
                onClick={() => go(item.link)}
                aria-current={active === item.link ? "true" : undefined}
                className={`relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 ${
                  active === item.link ? "text-ink" : "text-cream/70 hover:text-cream"
                }`}
              >
                {item.title}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href={ProfileData.resume}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary hidden !py-2.5 lg:inline-flex"
            >
              Resume <FiArrowUpRight />
            </a>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-cream/15 bg-ink-800/60 backdrop-blur-xl lg:hidden"
            >
              <span
                className={`absolute h-px w-5 bg-cream transition-transform duration-500 ease-expo ${
                  isMenuOpen ? "rotate-45" : "-translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-cream transition-transform duration-500 ease-expo ${
                  isMenuOpen ? "-rotate-45" : "translate-y-[4px]"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-ink-800 px-6 pb-10 pt-28 transition-[clip-path] duration-700 ease-expo lg:hidden ${
          isMenuOpen ? "[clip-path:circle(150%_at_100%_0)]" : "pointer-events-none [clip-path:circle(0%_at_100%_0)]"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <nav className="flex flex-col gap-2" aria-label="Mobile">
          {Navlinks.map((item, i) => (
            <div key={item.link} className="overflow-hidden">
              <button
                tabIndex={isMenuOpen ? 0 : -1}
                onClick={() => go(item.link)}
                className={`flex items-baseline gap-4 font-display text-5xl font-bold tracking-tight transition-transform duration-700 ease-expo sm:text-6xl ${
                  isMenuOpen ? "translate-y-0" : "translate-y-full"
                } ${active === item.link ? "text-ember" : "text-cream"}`}
                style={{ transitionDelay: isMenuOpen ? `${150 + i * 60}ms` : "0ms" }}
              >
                <span className="font-mono text-xs text-cream-mute">0{i + 1}</span>
                {item.title}
              </button>
            </div>
          ))}
        </nav>
        <div
          className={`flex flex-wrap items-center justify-between gap-4 transition-opacity duration-500 ${
            isMenuOpen ? "opacity-100 delay-500" : "opacity-0"
          }`}
        >
          <a href={`mailto:${ContactData.email}`} className="u-link text-cream-dim" tabIndex={isMenuOpen ? 0 : -1}>
            {ContactData.email}
          </a>
          <a
            href={ProfileData.resume}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Resume <FiArrowUpRight />
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
