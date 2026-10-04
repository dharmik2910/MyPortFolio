import React from "react";
import { FiArrowUp } from "react-icons/fi";
import Navlinks from "../data/navlinks";
import SocialHandles from "./SocialHandles";
import { scrollToSection } from "../lib/scroll";
import { useContent } from "../lib/ContentContext";

const Footer = () => {
  const { profile: ProfileData, contact: ContactData } = useContent();
  const firstName = ProfileData.name.split(" ")[0];

  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-ink-800 px-5 pt-20 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            Have an idea?
            <br />
            <button
              onClick={() => scrollToSection("contact")}
              className="u-link text-ember"
            >
              Let's talk.
            </button>
          </p>
        </div>
        <nav className="md:col-span-3" aria-label="Footer">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-cream-mute">Menu</p>
          <ul className="space-y-2">
            {Navlinks.map((l) => (
              <li key={l.link}>
                <button onClick={() => scrollToSection(l.link)} className="u-link text-cream-dim hover:text-cream">
                  {l.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-cream-mute">Say hello</p>
          <a href={`mailto:${ContactData.email}`} className="u-link break-all text-cream-dim hover:text-cream">
            {ContactData.email}
          </a>
          <SocialHandles className="mt-6" />
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl items-center justify-between border-t border-cream/10 py-6 font-mono text-xs uppercase tracking-[0.15em] text-cream-mute">
        <span>
          &copy; {new Date().getFullYear()} {ProfileData.name}
        </span>
        <button
          onClick={() => scrollToSection("top")}
          className="group flex items-center gap-2 transition-colors hover:text-cream"
        >
          Back to top
          <FiArrowUp className="transition-transform duration-500 ease-expo group-hover:-translate-y-1" />
        </button>
      </div>

      {/* Oversized signature */}
      <p
        aria-hidden="true"
        className="-mb-[0.16em] mt-8 select-none whitespace-nowrap text-center font-display text-[11.5vw] font-extrabold uppercase leading-none tracking-[-0.05em]"
      >
        {firstName.split("").map((ch, i) => (
          <span
            key={i}
            className="text-outline inline-block transition-all duration-500 ease-expo hover:-translate-y-[0.08em] hover:text-ember hover:[-webkit-text-stroke-color:transparent]"
          >
            {ch}
          </span>
        ))}
      </p>
    </footer>
  );
};

export default Footer;
