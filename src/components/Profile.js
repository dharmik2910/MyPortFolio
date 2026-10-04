import React, { useEffect, useRef, useState } from "react";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import SocialHandles from "./SocialHandles";
import HeroCanvas from "./HeroCanvas";
import useMagnetic from "../hooks/useMagnetic";
import { scrollToSection } from "../lib/scroll";
import { useContent } from "../lib/ContentContext";
import { useTheme } from "../lib/theme";

const SplitChars = ({ text, base = 0, className = "" }) => (
  <span className={`inline-block overflow-hidden pb-[0.04em] align-bottom ${className}`} aria-hidden="true">
    {text.split("").map((ch, i) => (
      <span key={i} className="char" style={{ "--i": i, "--base": `${base}ms` }}>
        {ch}
      </span>
    ))}
  </span>
);

// Vertically cycles through professions; a cloned first item makes the loop seamless.
const RotatingWords = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, 2600);
    return () => clearInterval(id);
  }, [words.length]);

  useEffect(() => {
    if (index === words.length) {
      const t = setTimeout(() => {
        setAnimate(false);
        setIndex(0);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [index, words.length]);

  const list = [...words, words[0]];
  return (
    <span className="relative inline-flex h-[1.25em] overflow-hidden align-bottom">
      <span
        className={`flex flex-col ${animate ? "transition-transform duration-700 ease-expo" : ""}`}
        style={{ transform: `translateY(-${index * 1.25}em)` }}
      >
        {list.map((w, i) => (
          <span key={i} className="h-[1.25em] leading-[1.25em] text-ember" aria-hidden={i !== index % words.length}>
            {w}
          </span>
        ))}
      </span>
    </span>
  );
};

const LocalTime = () => {
  const fmt = () =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return <span>{time} IST</span>;
};

const Profile = () => {
  const { profile: ProfileData, contact: ContactData } = useContent();
  const { theme } = useTheme();
  const [first, ...rest] = ProfileData.name.split(" ");
  const last = rest.join(" ");
  const contentRef = useRef(null);
  const hireRef = useMagnetic(0.3);
  const resumeRef = useMagnetic(0.3);

  // Gentle parallax + fade as the hero scrolls away
  useEffect(() => {
    const el = contentRef.current;
    const onScroll = () => {
      const y = window.scrollY;
      if (!el || y > window.innerHeight * 1.2) return;
      el.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
      el.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <HeroCanvas className="absolute inset-0" theme={theme} />

      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-5 pb-10 pt-28 will-change-transform md:px-8 md:pt-32"
      >
        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-dim">
          <span className="hero-fade" style={{ "--d": "700ms" }}>
            {ContactData.address.replace(/\s*,\s*/, ", ")} — <LocalTime />
          </span>
          {ProfileData.available !== false && (
            <span
              className="hero-fade flex items-center gap-2.5 rounded-full border border-cream/10 bg-ink/40 px-3.5 py-1.5 backdrop-blur"
              style={{ "--d": "800ms" }}
            >
              <span className="pulse-dot h-2 w-2 rounded-full bg-ok" />
              Available for work
            </span>
          )}
        </div>

        {/* Name */}
        <div className="my-10 md:my-6">
          <p className="hero-fade mb-4 font-mono text-xs uppercase tracking-[0.3em] text-cream-dim md:mb-2" style={{ "--d": "300ms" }}>
            Hello, I am
          </p>
          <h1
            aria-label={ProfileData.name}
            className="whitespace-nowrap font-display text-[9.6vw] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-cream md:text-[8.2vw] xl:text-[7.4rem]"
          >
            <span className="flex items-center gap-[0.12em]">
              <SplitChars text={first} />
              <span
                className="hero-portrait relative hidden h-[0.74em] overflow-hidden rounded-full bg-white ring-2 ring-ember ring-offset-4 ring-offset-ink md:inline-block"
                aria-hidden="true"
              >
                <img
                  src={ProfileData.img}
                  alt=""
                  className="h-full w-full object-cover object-[50%_45%] transition-transform duration-700 ease-expo hover:scale-105"
                />
              </span>
            </span>
            <span className="flex items-center justify-start md:justify-end">
              <SplitChars text={last} base={250} className="text-outline" />
            </span>
          </h1>
        </div>

        {/* Bottom row */}
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <div className="hero-fade flex items-center gap-4 md:hidden" style={{ "--d": "900ms" }}>
              <img
                src={ProfileData.img}
                alt={ProfileData.name}
                className="h-16 w-16 rounded-full border border-cream/20 bg-cream object-cover object-[50%_30%]"
              />
              <SocialHandles />
            </div>
            <p className="hero-fade mt-6 font-display text-2xl font-semibold md:mt-0 md:text-3xl" style={{ "--d": "1000ms" }}>
              <RotatingWords words={ProfileData.professions} />
            </p>
            {ProfileData.info?.map((item, index) => (
              <p
                key={index}
                className="hero-fade mt-3 max-w-md text-base leading-relaxed text-cream-dim md:text-lg"
                style={{ "--d": `${1100 + index * 100}ms` }}
              >
                {item}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-8 md:col-span-6 md:items-end lg:col-span-7">
            <SocialHandles className="hero-fade hidden md:flex" />
            <div className="hero-fade flex flex-wrap gap-3" style={{ "--d": "1300ms" }}>
              <button ref={hireRef} onClick={() => scrollToSection("contact")} className="btn btn-primary">
                Hire Me <FiArrowUpRight />
              </button>
              <a ref={resumeRef} href={ProfileData.resume} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Get Resume
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Rotating scroll badge */}
      <button
        onClick={() => scrollToSection("about")}
        aria-label="Scroll to About"
        className="hero-fade group absolute bottom-8 left-1/2 z-10 hidden h-28 w-28 -translate-x-1/2 place-items-center lg:grid"
        style={{ "--d": "1500ms" }}
      >
        <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full text-cream/60">
          <defs>
            <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-current font-mono text-[8.5px] uppercase">
            <textPath href="#badge-circle" textLength="236" lengthAdjust="spacing">
              Scroll to explore • Scroll to explore •
            </textPath>
          </text>
        </svg>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 ease-expo group-hover:translate-y-1 group-hover:bg-ember">
          <FiArrowDown />
        </span>
      </button>
    </section>
  );
};

export default Profile;
