import React, { useEffect, useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import SectionHeading from "./SectionHeading";
import useMagnetic from "../hooks/useMagnetic";
import { prefersReducedMotion, scrollToSection } from "../lib/scroll";
import { useContent } from "../lib/ContentContext";

// Words light up one by one as the paragraph scrolls through the viewport.
const ScrollWords = ({ text }) => {
  const ref = useRef(null);
  const words = text.split(" ");
  const [progress, setProgress] = useState(prefersReducedMotion() ? 1 : 0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = null;
    const update = () => {
      raf = null;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <p
      ref={ref}
      className="font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
    >
      {words.map((w, i) => {
        const lit = i / words.length < progress;
        return (
          <span
            key={i}
            className={`transition-colors duration-500 ${lit ? "text-cream" : "text-cream/15"}`}
          >
            {w}{" "}
          </span>
        );
      })}
    </p>
  );
};

const CountUp = ({ to, suffix = "" }) => {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }
    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 1600, 1);
        setValue(Math.round((1 - Math.pow(1 - t, 3)) * to));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
};

const About = () => {
  const { about: AboutData, profile: ProfileData, projects: ProjectsData, skills: SkillsData } = useContent();
  const hireRef = useMagnetic(0.3);
  const stats = [
    { value: ProjectsData.length, suffix: "+", label: "Projects shipped" },
    { value: SkillsData.length, suffix: "", label: "Technologies" },
    { value: 100, suffix: "%", label: "Responsive builds" },
  ];

  return (
    <section id="about" className="relative px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-44">
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="01" label="About" title="Why" accent="hire me?" />

        <ScrollWords text={AboutData.statement} />

        <div className="mt-20 grid gap-14 md:mt-28 md:grid-cols-12">
          {/* Stats */}
          <div className="md:col-span-5">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 md:grid-cols-1">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  data-reveal="up"
                  style={{ "--d": `${i * 100}ms` }}
                  className="bg-ink p-5 md:flex md:items-end md:justify-between md:p-7"
                >
                  <span className="block font-display text-4xl font-bold text-cream md:text-6xl">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </span>
                  <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-cream-dim md:mt-0 md:text-xs">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Story */}
          <div className="md:col-span-7 md:pl-6 lg:pl-12">
            {AboutData.description?.map((item, index) => (
              <p
                key={index}
                data-reveal="blur"
                style={{ "--d": `${index * 120}ms` }}
                className="mb-6 text-lg leading-relaxed text-cream-dim md:text-xl"
              >
                {item}
              </p>
            ))}
            <div data-reveal="up" className="mt-10 flex flex-wrap gap-3">
              <button ref={hireRef} onClick={() => scrollToSection("contact")} className="btn btn-primary">
                Hire Me <FiArrowUpRight />
              </button>
              <a href={ProfileData.resume} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Get Resume
              </a>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-24 border-t border-cream/10 md:mt-32">
          {AboutData.services.map((s, i) => (
            <div
              key={s.title}
              data-reveal="up"
              style={{ "--d": `${i * 80}ms` }}
              className="group relative grid grid-cols-12 items-baseline gap-4 overflow-hidden border-b border-cream/10 py-8 md:py-10"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-700 ease-expo group-hover:scale-y-100"
              />
              <span className="relative col-span-2 font-mono text-xs text-cream-mute transition-colors duration-500 group-hover:text-ink md:col-span-1 md:pl-4">
                0{i + 1}
              </span>
              <h3 className="relative col-span-10 font-display text-2xl font-bold uppercase tracking-tight text-cream transition-all duration-500 ease-expo group-hover:translate-x-3 group-hover:text-ink md:col-span-5 md:text-4xl">
                {s.title}
              </h3>
              <p className="relative col-span-10 col-start-3 text-cream-dim transition-colors duration-500 group-hover:text-ink/80 md:col-span-6 md:pr-4 md:text-lg">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
