import React from "react";
import { useContent } from "../lib/ContentContext";
import { resolveIcon } from "../lib/iconsCore";

const labelFor = (url) => {
  if (url.includes("github")) return "GitHub";
  if (url.includes("linkedin")) return "LinkedIn";
  if (url.includes("instagram")) return "Instagram";
  if (url.includes("x.com") || url.includes("twitter")) return "X";
  return "Social link";
};

const SocialHandles = ({ className = "" }) => {
  const { contact: ContactData } = useContent();
  return (
    <div className={`flex gap-3 ${className}`}>
      {ContactData?.links?.map((link, index) => {
        const Icon = resolveIcon(link.icon);
        return (
        <a
          key={index}
          className="group grid h-11 w-11 place-items-center rounded-full border border-cream/15 text-lg text-cream/80 transition-all duration-500 ease-expo hover:-translate-y-1 hover:border-ember hover:bg-ember hover:text-ink"
          href={link.url}
          target="_blank"
          rel="noreferrer"
          aria-label={labelFor(link.url)}
        >
          <Icon className="transition-transform duration-500 ease-expo group-hover:scale-110" />
        </a>
        );
      })}
    </div>
  );
};

export default SocialHandles;
