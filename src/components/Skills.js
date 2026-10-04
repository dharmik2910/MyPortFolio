import React from "react";
import SectionHeading from "./SectionHeading";
import Marquee from "./Marquee";
import { readableBrandColor, trackSpotlight } from "../lib/scroll";
import { useTheme } from "../lib/theme";
import { useContent } from "../lib/ContentContext";
import { resolveIcon } from "../lib/iconsCore";

const groupByCategory = (skills) =>
  skills.reduce((acc, skill) => {
    const key = skill.category || "Other";
    (acc[key] = acc[key] || []).push(skill);
    return acc;
  }, {});

// Bento spans so the grid reads as a composed layout rather than equal tiles.
const SPANS = {
  Frontend: "md:col-span-4 md:row-span-2",
  Backend: "md:col-span-2 md:row-span-2",
  Database: "md:col-span-3",
  "Cloud & DevOps": "md:col-span-3",
  Tools: "md:col-span-4",
  Other: "md:col-span-2",
};

const SkillPill = ({ skill }) => {
  const { theme } = useTheme();
  const Icon = resolveIcon(skill.icon);
  return (
    <span className="flex items-center gap-3 whitespace-nowrap rounded-full border border-cream/10 bg-ink-800 px-5 py-3 text-base font-medium text-cream md:text-lg">
      <Icon style={{ color: readableBrandColor(skill.color, theme) }} className="text-xl md:text-2xl" />
      {skill.name}
    </span>
  );
};

const Skills = () => {
  const { skills: SkillsData } = useContent();
  const { theme } = useTheme();
  const groups = groupByCategory(SkillsData);
  const half = Math.ceil(SkillsData.length / 2);

  return (
    <section id="skills" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading index="02" label="Skills" title="Tech" accent="arsenal" />
      </div>

      <div className="flex flex-col gap-4" data-reveal="fade">
        <Marquee
          items={SkillsData.slice(0, half)}
          speed="55s"
          renderItem={(skill) => <SkillPill skill={skill} />}
          className="[--gap:1rem]"
        />
        <Marquee
          items={SkillsData.slice(half)}
          speed="55s"
          reverse
          renderItem={(skill) => <SkillPill skill={skill} />}
          className="[--gap:1rem]"
        />
      </div>

      <div className="mx-auto mt-16 grid max-w-7xl auto-rows-auto gap-4 px-5 md:mt-24 md:grid-cols-6 md:px-8">
        {Object.entries(groups).map(([category, skills], i) => (
          <article
            key={category}
            data-reveal="up"
            style={{ "--d": `${(i % 3) * 90}ms` }}
            onPointerMove={trackSpotlight}
            className={`spotlight group flex flex-col justify-between overflow-hidden rounded-3xl border border-cream/10 bg-ink-800/60 p-6 transition-colors duration-500 hover:border-ember/40 md:p-8 ${
              SPANS[category] || "md:col-span-2"
            }`}
          >
            <header className="mb-8 flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-cream md:text-3xl">
                {category}
              </h3>
              <span className="font-mono text-xs text-cream-mute">
                {String(skills.length).padStart(2, "0")}
              </span>
            </header>
            <ul className="relative z-10 flex flex-wrap gap-2.5">
              {skills.map((skill) => {
                const Icon = resolveIcon(skill.icon);
                const color = readableBrandColor(skill.color, theme);
                return (
                  <li
                    key={skill.name}
                    className="group/skill flex items-center gap-2.5 rounded-full border border-cream/10 bg-ink/60 px-4 py-2.5 text-sm text-cream-dim transition-all duration-300 hover:-translate-y-0.5 hover:border-cream/30 hover:text-cream"
                  >
                    <Icon
                      className="text-lg text-cream/60 transition-colors duration-300 group-hover/skill:text-[var(--c)]"
                      style={{ "--c": color }}
                    />
                    {skill.name}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Skills;
