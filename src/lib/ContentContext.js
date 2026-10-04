import React, { createContext, useContext, useEffect, useState } from "react";
import ProfileData from "../data/profile";
import AboutData from "../data/about";
import ContactData from "../data/contact";
import ProjectsData from "../data/projects";
import SkillsData from "../data/skills";
import { loadIcons } from "./iconsCore";

const DEFAULT_PHOTO = ProfileData.img;

// Static files double as the fallback when the API is unreachable (e.g. plain `npm start`).
export const DEFAULT_CONTENT = {
  profile: ProfileData,
  about: AboutData,
  contact: ContactData,
  projects: ProjectsData,
  skills: SkillsData,
};

const withFallbacks = (data) => ({
  profile: { ...ProfileData, ...data.profile, img: data.profile?.img || DEFAULT_PHOTO },
  about: { ...AboutData, ...data.about },
  contact: { ...ContactData, ...data.contact },
  projects: Array.isArray(data.projects) ? data.projects : ProjectsData,
  skills: Array.isArray(data.skills) ? data.skills : SkillsData,
});

export const fetchContent = async () => {
  const res = await fetch("/api/content");
  if (!res.ok) throw new Error(`Content request failed (${res.status})`);
  return withFallbacks(await res.json());
};

const ContentContext = createContext(DEFAULT_CONTENT);

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    let cancelled = false;
    // New object identity re-renders consumers so placeholder icons swap to real ones.
    loadIcons().then(() => !cancelled && setContent((c) => ({ ...c })));
    fetchContent()
      .then((data) => !cancelled && setContent(data))
      .catch(() => {}); // keep static defaults
    return () => {
      cancelled = true;
    };
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
};

export const useContent = () => useContext(ContentContext);
