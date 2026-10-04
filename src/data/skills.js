// Fallback content — the live site reads this from the database via /api/content.
const SkillsData = [
  { name: "HTML5", icon: "SiHtml5", color: "#E34F26", category: "Frontend" },
  { name: "CSS3", icon: "SiCss3", color: "#1572B6", category: "Frontend" },
  { name: "JavaScript", icon: "SiJavascript", color: "#F7DF1E", category: "Frontend" },
  { name: "TypeScript", icon: "SiTypescript", color: "#3178C6", category: "Frontend" },

  { name: "React.js", icon: "SiReact", color: "#61DAFB", category: "Frontend" },
  { name: "Next.js", icon: "SiNextdotjs", color: "#000000", category: "Frontend" },
  { name: "Tailwind CSS", icon: "SiTailwindcss", color: "#06B6D4", category: "Frontend" },
  { name: "Redux", icon: "SiRedux", color: "#764ABC", category: "Frontend" },

  { name: "Node.js", icon: "SiNodedotjs", color: "#339933", category: "Backend" },
  { name: "Express.js", icon: "SiExpress", color: "#000000", category: "Backend" },
  { name: "Elysia.js", icon: "TbBrandNodejs", color: "#8B5CF6", category: "Backend" },

  { name: "REST APIs", icon: "TbApi", color: "#0EA5E9", category: "Backend" },
  { name: "Socket.io", icon: "SiSocketdotio", color: "#010101", category: "Backend" },

  { name: "PostgreSQL", icon: "SiPostgresql", color: "#4169E1", category: "Database" },
  { name: "MongoDB", icon: "SiMongodb", color: "#47A248", category: "Database" },
  { name: "MySQL", icon: "SiMysql", color: "#4479A1", category: "Database" },
  { name: "Prisma", icon: "SiPrisma", color: "#2D3748", category: "Database" },
  { name: "Redis", icon: "SiRedis", color: "#DC382D", category: "Database" },

  { name: "AWS", icon: "FaAws", color: "#FF9900", category: "Cloud & DevOps" },
  { name: "Docker", icon: "SiDocker", color: "#2496ED", category: "Cloud & DevOps" },

  { name: "Git", icon: "SiGit", color: "#F05032", category: "Tools" },
  { name: "GitHub", icon: "SiGithub", color: "#181717", category: "Tools" },
  { name: "GitLab", icon: "SiGitlab", color: "#FC6D26", category: "Tools" },

  { name: "Postman", icon: "SiPostman", color: "#FF6C37", category: "Tools" },
  { name: "VS Code", icon: "TbBrandVscode", color: "#007ACC", category: "Tools" },

  { name: "Python", icon: "SiPython", color: "#3776AB", category: "Other" },
  { name: "SAP", icon: "SiSap", color: "#0FAAFF", category: "Other" },
];

export default SkillsData;