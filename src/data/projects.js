import { BiLogoMongodb, BiLogoReact, BiLogoRedux, BiLogoTailwindCss, BiLogoTypescript, BiLogoHtml5, BiLogoCss3, BiLogoJavascript } from "react-icons/bi";
import { TbBrandNextjs, TbApi, TbBrandPrisma } from "react-icons/tb";
import { SiExpress } from "react-icons/si";

const ProjectsData = [
  {
    id: "1",
    name: "Zelbi (AI-Powered Investment Dashboard)",
    image: "/zelbi.png",
    icons: [BiLogoReact, BiLogoRedux, BiLogoTailwindCss, BiLogoMongodb],
    description: "A full-stack investment dashboard with AI-powered insights, portfolio analytics, real-time tracking, and secure authentication using React, Redux, and MongoDB.",
    github: "https://github.com/dharmik2910/Zelbi-AI-Powered-Investment-Dashboard-",
    demo: "https://zelbi-ai-powered-investment-dashboard.vercel.app",
  },
  {
    id: "2",
    name: "E-Commerce-Store",
    image: "/E Commerce Store.png",
    icons: [BiLogoReact, BiLogoRedux, TbApi, BiLogoTailwindCss],
    description: "A full-featured e-commerce platform with shopping cart, product management, and user authentication.",
    github: "https://github.com/dharmik2910/E-Commerce-Store",
    demo: "https://e-commerce-store-vite.vercel.app",
  },
  {
    id: "4",
    name: "Blog Website",
    image: "/manga.jpeg",
    icons: [ BiLogoMongodb, SiExpress, BiLogoReact, BiLogoRedux, BiLogoTailwindCss],
    description: "A responsive blogging platform with user authentication, rich text editor, categories, and comment system.",
    github: "https://github.com/dharmik2910/",
    demo: "https://vtrack-expen.vercel.app",
  },
  {
    id: "8",
    name: "Cancer Awareness & Support page",
    image: "/cancer.png",
    icons: [BiLogoHtml5, BiLogoCss3, BiLogoJavascript],
    description: "A responsive static landing page with modern UI/UX featuring newsletter, FAQ accordion, contact form, and daily quote widget.",
    github: "https://github.com/dharmik2910/Cancer-Awareness-Support",
    demo: "https://cancerawarenessandsupport.netlify.app/",
  },
  {
    id: "3",
    name: "Chatbot",
    image: "/chatbot.png",
    icons: [TbBrandNextjs, BiLogoTypescript, BiLogoTailwindCss, TbBrandPrisma],
    description: "A modern chatbot application with real-time messaging, admin dashboard, and WebSocket-based communication using Next.js and Prisma.",
    github: "https://github.com/dharmik2910/Chatbot",
    demo: "",
  },
  {
    id: "5",
    name: "Account Manager",
    image: "/account-manager.png",
    icons: [BiLogoReact, BiLogoTailwindCss, TbApi],
    description: "An account management platform for user registration, login, and account information management with client-side storage.",
    github: "https://github.com/dharmik2910/Chaintech-Account-Manager",
    demo: "https://chaintech-account-manager-gnzwljf1t.vercel.app/",
  },
];

export default ProjectsData;
