import React from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import SectionHeading from "./SectionHeading";
import { isTouchDevice, prefersReducedMotion, trackSpotlight } from "../lib/scroll";
import { useContent } from "../lib/ContentContext";
import { resolveIcon } from "../lib/iconsCore";

const tilt = (e) => {
  if (isTouchDevice() || prefersReducedMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
};
const resetTilt = (e) => {
  e.currentTarget.style.transform = "";
};

const STATUS_LABELS = { "in-progress": "In progress", "coming-soon": "Coming soon" };

const ProjectCard = ({ project, index, featured = false }) => {
  // The cover links to the demo, or the first extra link when there's no demo yet.
  const primaryUrl = project.demo || project.links?.[0]?.url;
  const Cover = primaryUrl ? "a" : "div";
  const coverProps = primaryUrl
    ? {
        href: primaryUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        "data-cursor": "View",
        "aria-label": `Open ${project.name}`,
      }
    : {};

  return (
    <article
      data-reveal="up"
      className={`group ${featured ? "lg:col-span-2 lg:grid lg:grid-cols-12 lg:items-end lg:gap-12" : ""}`}
      style={{ "--d": `${(index % 2) * 120}ms` }}
    >
      <Cover
        {...coverProps}
        onPointerMove={tilt}
        onPointerLeave={resetTilt}
        className={`block transition-transform duration-500 ease-out [transform-style:preserve-3d] ${
          featured ? "lg:col-span-7" : ""
        }`}
      >
        <div
          data-clip
          className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-cream/10 bg-ink-700"
        >
          {project.image ? (
            <img
              src={project.image}
              alt={project.name}
              loading="lazy"
              className="h-full w-full scale-105 object-cover object-top transition-transform duration-[1.2s] ease-expo group-hover:scale-100"
            />
          ) : (
            // No screenshot yet: oversized initial on an ember glow
            <div className="grid h-full w-full scale-105 place-items-center bg-[radial-gradient(ellipse_at_70%_30%,rgba(255,88,35,0.35),transparent_65%)] transition-transform duration-[1.2s] ease-expo group-hover:scale-100">
              <span className="text-outline select-none font-display text-[9rem] font-extrabold uppercase leading-none md:text-[12rem]">
                {project.name.trim().charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
          <span className="absolute left-5 top-5 rounded-full border border-cream/20 bg-ink/50 px-3 py-1 font-mono text-[11px] text-cream backdrop-blur">
            {String(index + 1).padStart(2, "0")}
            {featured && <span className="ml-2 text-ember">Featured</span>}
            {STATUS_LABELS[project.status] && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-ok">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-ok" />
                {STATUS_LABELS[project.status]}
              </span>
            )}
          </span>
          <div className="absolute bottom-5 left-5 flex gap-2">
            {project?.icons?.map((name, i) => {
              const Icon = resolveIcon(name);
              return (
                <span
                  key={i}
                  className="grid h-9 w-9 translate-y-3 place-items-center rounded-full bg-cream/90 text-lg text-ink opacity-0 transition-all duration-500 ease-expo group-hover:translate-y-0 group-hover:opacity-100"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <Icon />
                </span>
              );
            })}
          </div>
          {primaryUrl && (
            <span className="absolute bottom-5 right-5 grid h-12 w-12 scale-0 place-items-center rounded-full bg-ember text-xl text-ink transition-transform duration-500 ease-expo group-hover:scale-100 lg:hidden">
              <FiArrowUpRight />
            </span>
          )}
        </div>
      </Cover>

      <div
        className={`mt-6 flex flex-col gap-4 ${
          featured ? "lg:col-span-5 lg:mt-0 lg:gap-8 lg:pb-2" : "md:flex-row md:items-start md:justify-between"
        }`}
      >
        <div className="max-w-xl">
          {featured && (
            <p className="mb-4 hidden font-mono text-xs uppercase tracking-[0.2em] text-ember lg:block">
              Featured project
            </p>
          )}
          <h3
            className={`font-display font-bold tracking-tight text-cream transition-colors duration-300 group-hover:text-ember ${
              featured ? "text-2xl md:text-3xl lg:text-5xl lg:leading-[1.05]" : "text-2xl md:text-3xl"
            }`}
          >
            {project.name}
          </h3>
          <p className="mt-2 leading-relaxed text-cream-dim">{project.description}</p>
          {project.links?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center gap-2 rounded-full border border-cream/15 py-1.5 pl-4 pr-1.5 text-sm text-cream transition-colors duration-300 hover:border-ember hover:text-ember"
                >
                  {link.label}
                  {link.tag && (
                    <span className="rounded-full bg-cream/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cream-dim">
                      {link.tag}
                    </span>
                  )}
                  <FiArrowUpRight className="mr-1.5 transition-transform duration-300 group-hover/link:rotate-45" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.name} source on GitHub`}
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 text-cream transition-all duration-300 hover:border-cream hover:bg-cream hover:text-ink"
            >
              <FiGithub />
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.name} live demo`}
              className="grid h-11 w-11 place-items-center rounded-full bg-ember text-lg text-ink transition-transform duration-500 ease-expo hover:rotate-45"
            >
              <FiArrowUpRight />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

const Projects = () => {
  const { projects: ProjectsData, contact: ContactData } = useContent();
  const githubUrl = ContactData.links?.find((l) => l.url.includes("github"))?.url;
  const featured = ProjectsData.find((p) => p.featured);
  const rest = ProjectsData.filter((p) => p !== featured);

  return (
    <section id="projects" className="relative px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading index="03" label="Projects" title="Selected" accent="works" />
          <p data-reveal="fade" className="mb-14 max-w-xs text-cream-dim md:mb-20">
            A mix of full-stack products, AI experiments and polished frontends — each one live and open source.
          </p>
        </div>

        <div className="grid gap-x-10 gap-y-20 lg:grid-cols-2">
          {featured && <ProjectCard project={featured} index={0} featured />}
          {rest.map((project, i) => (
            <div key={project.id} className={i % 2 === 1 ? "lg:mt-32" : ""}>
              <ProjectCard project={project} index={featured ? i + 1 : i} />
            </div>
          ))}
        </div>

        <div
          data-reveal="up"
          onPointerMove={trackSpotlight}
          className="spotlight mt-24 flex flex-col items-start justify-between gap-6 rounded-3xl border border-cream/10 bg-ink-800/60 p-8 md:flex-row md:items-center md:p-12"
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
