import React, { useEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import SectionHeading from "./SectionHeading";
import { prefersReducedMotion, trackSpotlight } from "../lib/scroll";
import { useContent } from "../lib/ContentContext";
import { resolveIcon } from "../lib/iconsCore";

const STATUS_LABELS = { "in-progress": "In progress", "coming-soon": "Coming soon" };
const PREVIEW_W = 400; // px, floating preview width (16:11)

// "Zelbi (AI-Powered Investment Dashboard)" → title "Zelbi", subtitle "AI-Powered Investment Dashboard"
const splitName = (name) => {
  const m = /^(.*?)\s*\((.+)\)\s*$/.exec(name.trim());
  return m ? [m[1], m[2]] : [name.trim().replace(/-/g, " "), ""];
};

const primaryUrl = (p) => p.demo || p.links?.[0]?.url;

const Shot = ({ project, className = "" }) =>
  project.image ? (
    <img src={project.image} alt="" loading="lazy" className={`h-full w-full object-cover object-top ${className}`} />
  ) : (
    // No screenshot yet: oversized initial on an ember glow
    <div className={`grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_70%_30%,rgba(255,88,35,0.35),transparent_65%)] bg-ink-700 ${className}`}>
      <span className="text-outline select-none font-display text-8xl font-extrabold uppercase leading-none">
        {project.name.trim().charAt(0)}
      </span>
    </div>
  );

// One screenshot card that trails the cursor while the list is hovered. All shots sit
// in a vertical strip; switching rows slides the strip, so images never pop in.
const FloatingPreview = React.forwardRef(({ projects, active, visible }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className="pointer-events-none fixed left-0 top-0 z-40 hidden [@media(hover:hover)]:block"
    style={{ transform: "translate3d(-9999px, -9999px, 0)" }}
  >
    <div
      className={`overflow-hidden rounded-2xl border border-cream/15 bg-ink-700 shadow-2xl shadow-black/40 transition-[opacity,transform] duration-500 ease-expo ${
        visible ? "scale-100 opacity-100" : "scale-75 opacity-0"
      }`}
      style={{ width: PREVIEW_W, height: (PREVIEW_W * 11) / 16 }}
    >
      <div
        className="h-full transition-transform duration-700 ease-expo"
        style={{ transform: `translateY(${-Math.max(active, 0) * 100}%)` }}
      >
        {projects.map((p) => (
          <div key={p.id} className="h-full">
            <Shot project={p} />
          </div>
        ))}
      </div>
    </div>
  </div>
));

const ProjectRow = ({ project, index, onEnter }) => {
  const [title, subtitle] = splitName(project.name);
  const url = primaryUrl(project);
  const status = STATUS_LABELS[project.status];

  return (
    <li
      data-reveal="up"
      style={{ "--d": `${Math.min(index, 6) * 70}ms` }}
      onPointerEnter={() => onEnter(index)}
      className="group relative border-b border-cream/10"
    >
      {/* Fill that rises behind the row on hover */}
      <span className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-cream/[0.04] transition-transform duration-500 ease-expo group-hover:scale-y-100" />

      <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 py-6 md:gap-x-8 md:py-8">
        {/* Index on hover screens; on touch screens a thumbnail stands in for the floating preview */}
        <span className="self-start pt-2 font-mono text-xs text-cream-mute md:pt-3 [@media(hover:none)]:hidden">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="hidden h-16 w-20 self-start overflow-hidden rounded-xl border border-cream/10 sm:h-20 sm:w-28 [@media(hover:none)]:block">
          <Shot project={project} />
        </div>

        <div className="min-w-0">
          <h3 className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="View"
                className="font-display text-2xl font-bold uppercase leading-none tracking-[-0.03em] text-cream transition-[color,transform] sm:text-3xl duration-500 ease-expo after:absolute after:inset-0 group-hover:translate-x-2 group-hover:text-ember md:text-5xl lg:text-6xl"
              >
                {title}
              </a>
            ) : (
              <span className="font-display text-2xl font-bold uppercase leading-none tracking-[-0.03em] text-cream sm:text-3xl md:text-5xl lg:text-6xl">
                {title}
              </span>
            )}
            {project.featured && (
              <span className="rounded-full border border-ember/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
                Featured
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ok">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-ok" />
                {status}
              </span>
            )}
          </h3>
          {subtitle && <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cream-dim sm:text-xs">{subtitle}</p>}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-dim md:text-base">{project.description}</p>
          {project.links?.length > 0 && (
            <div className="relative z-10 mt-3 flex flex-wrap gap-2">
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1 text-xs text-cream transition-colors duration-300 hover:border-ember hover:text-ember"
                >
                  {link.label}
                  {link.tag && <span className="font-mono text-[10px] uppercase text-cream-mute">{link.tag}</span>}
                  <FiArrowUpRight />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 col-start-2 flex items-center gap-3 md:col-start-auto md:gap-4 md:self-center">
          <div className="hidden gap-1.5 text-lg text-cream-mute lg:flex">
            {project.icons?.map((name, i) => {
              const Icon = resolveIcon(name);
              return (
                <span key={i} className="transition-colors duration-300 group-hover:text-cream" style={{ transitionDelay: `${i * 40}ms` }}>
                  <Icon />
                </span>
              );
            })}
          </div>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${title} source on GitHub`}
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 text-cream transition-all duration-300 hover:border-cream hover:bg-cream hover:text-ink"
            >
              <FiGithub />
            </a>
          )}
          {url && (
            <span
              aria-hidden="true"
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 text-lg text-cream transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:border-ember group-hover:bg-ember group-hover:text-ink"
            >
              <FiArrowUpRight />
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

const Projects = () => {
  const { projects: ProjectsData, contact: ContactData } = useContent();
  const githubUrl = ContactData.links?.find((l) => l.url.includes("github"))?.url;
  // Featured project leads the list.
  const projects = [...ProjectsData].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  const [active, setActive] = useState(-1);
  const previewRef = useRef(null);
  const target = useRef({ x: -9999, y: -9999 });
  const raf = useRef(0);

  // Ease the preview toward the cursor and tilt it with horizontal speed.
  useEffect(() => {
    if (active < 0) return undefined;
    const snap = prefersReducedMotion();
    const cur = { ...target.current };
    const tick = () => {
      const t = target.current;
      const k = snap ? 1 : 0.14;
      const dx = (t.x - cur.x) * k;
      cur.x += dx;
      cur.y += (t.y - cur.y) * k;
      const r = snap ? 0 : Math.max(-8, Math.min(8, dx * 0.25));
      if (previewRef.current) previewRef.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) rotate(${r}deg)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  const onMove = (e) => {
    const w = PREVIEW_W;
    const h = (PREVIEW_W * 11) / 16;
    // Sit to the right of the cursor; flip left near the edge.
    const x = e.clientX + 32 + w > window.innerWidth ? e.clientX - 32 - w : e.clientX + 32;
    target.current = { x, y: Math.min(Math.max(e.clientY - h / 2, 16), window.innerHeight - h - 16) };
  };

  return (
    <section id="projects" className="relative px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading index="03" label="Projects" title="Selected" accent="works" />
          <p data-reveal="fade" className="mb-14 max-w-xs text-cream-dim md:mb-20">
            A mix of full-stack products, AI experiments and polished frontends — each one live and open source.
          </p>
        </div>

        <ul
          className="border-t border-cream/10"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(-1)}
        >
          {projects.map((project, i) => (
            <ProjectRow key={project.id} project={project} index={i} onEnter={setActive} />
          ))}
        </ul>

        <FloatingPreview ref={previewRef} projects={projects} active={active} visible={active >= 0} />

        <div
          data-reveal="up"
          onPointerMove={trackSpotlight}
          className="spotlight mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-cream/10 bg-ink-800/60 p-8 md:flex-row md:items-center md:p-10"
        >
          <p className="font-display text-2xl font-bold uppercase tracking-tight md:text-4xl">
            More on <span className="text-ember">GitHub</span>
          </p>
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost relative z-10">
            <FiGithub /> Browse all repositories
          </a>
        </div>
      </div>
    </section>
  );
};

export default Projects;
