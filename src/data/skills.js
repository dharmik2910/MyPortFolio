import {
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiRedux,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiMongodb,
  SiMysql,
  SiPrisma,
  SiRedis,
  SiDocker,
  SiGit,
  SiGithub,
  SiGitlab,
  SiPostman,
  SiSocketdotio,
  SiPython,
  SiSap,
} from "react-icons/si";

import { FaAws } from "react-icons/fa6";
import { TbApi, TbBrandVscode, TbBrandNodejs } from "react-icons/tb";

const SkillsData = [
  { name: "HTML5", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS3", icon: SiCss3, color: "#1572B6" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },

  { name: "React.js", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Redux", icon: SiRedux, color: "#764ABC" },

  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "Express.js", icon: SiExpress, color: "#000000" },
  { name: "Elysia.js", icon: TbBrandNodejs, color: "#8B5CF6" },

  { name: "REST APIs", icon: TbApi, color: "#0EA5E9" },
  { name: "Socket.io", icon: SiSocketdotio, color: "#010101" },

  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "MySQL", icon: SiMysql, color: "#4479A1" },
  { name: "Prisma", icon: SiPrisma, color: "#2D3748" },
  { name: "Redis", icon: SiRedis, color: "#DC382D" },

  { name: "AWS", icon: FaAws, color: "#FF9900" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },

  { name: "Git", icon: SiGit, color: "#F05032" },
  { name: "GitHub", icon: SiGithub, color: "#181717" },
  { name: "GitLab", icon: SiGitlab, color: "#FC6D26" },

  { name: "Postman", icon: SiPostman, color: "#FF6C37" },
  { name: "VS Code", icon: TbBrandVscode, color: "#007ACC" },

  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "SAP", icon: SiSap, color: "#0FAAFF" },
];

export default SkillsData;