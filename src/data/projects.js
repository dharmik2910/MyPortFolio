import {
  BiLogoCss3,
  BiLogoFirebase,
  BiLogoHtml5,
  BiLogoJavascript,
  BiLogoMongodb,
  BiLogoNodejs,
  BiLogoReact,
  BiLogoRedux,
  BiLogoTailwindCss,
  BiLogoTypescript
} from "react-icons/bi";

import { SiExpress } from "react-icons/si";

import {
  TbApi,
  TbBrandNextjs,
  TbBrandPrisma,
} from "react-icons/tb";

const ProjectsData = [
  {
    id: "1",
    name: "Zelbi (AI-Powered Investment Dashboard)",
    image: "/zelbi.png",
    icons: [BiLogoReact, BiLogoRedux, BiLogoTailwindCss, BiLogoMongodb],
    description: "A full-stack investment dashboard with AI-powered insights, portfolio analytics, real-time tracking, and secure authentication using React, Redux, and MongoDB.",
    github: "https://github.com/dharmik2910/Zelbi-AI-Powered-Investment-Dashboard-",
    demo: "http://13.127.181.122/",
  },
   
  {
    id: "3",
    name: "E-Commerce-Store",
    image: "/E Commerce Store.png",
    icons: [BiLogoReact, BiLogoRedux, TbApi, BiLogoTailwindCss],
    description: "A full-featured e-commerce platform with shopping cart, product management, and user authentication.",
    github: "https://github.com/dharmik2910/E-Commerce-Store",
    demo: "https://e-commerce-store-vite.vercel.app",
  },
{
  id: "7",
  name: "Quiz Player",
  image: "/Quiz Player.png",
  icons: [BiLogoReact, BiLogoFirebase],
  description:
    "An interactive quiz platform built with React and Firebase, featuring quiz management, real-time data, authentication, and a responsive user interface.",
  github: "https://github.com/dharmik2910/Quiz-Player",
  demo: "https://quiz-player-ten.vercel.app/",
},
 {
    id: "2",
    name: "Chatbot",
    image: "/chatbot.png",
    icons: [TbBrandNextjs, BiLogoTypescript, BiLogoTailwindCss, TbBrandPrisma],
    description: "A modern chatbot application with real-time messaging, admin dashboard, and WebSocket-based communication using Next.js and Prisma.",
    github: "https://github.com/dharmik2910/Chatbot",
    demo: "https://chatbotandsupport.netlify.app/",
  },
{
  id: "8",
  name: "Chat with Website",
  image: "/Chat with Website.png",
  icons: [TbBrandNextjs, BiLogoNodejs, TbApi],
  description:
    "An AI-powered web application that crawls website content using Cheerio and enables users to interact with website content through a conversational chat interface.",
  github: "https://github.com/dharmik2910/chat-with-website",
  demo: "https://chat-with-website-production.up.railway.app/",
},
  {
    id: "4",
    name: "Cancer Awareness & Support page",
    image: "/cancer.png",
    icons: [BiLogoHtml5, BiLogoCss3, BiLogoJavascript],
    description: "A responsive static landing page with modern UI/UX featuring newsletter, FAQ accordion, contact form, and daily quote widget.",
    github: "https://github.com/dharmik2910/Cancer-Awareness-Support",
    demo: "https://cancerawarenessandsupport.netlify.app/",
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
  {
    id: "6",
    name: "Blog Website",
    image: "/manga.jpeg",
    icons: [ BiLogoMongodb, SiExpress, BiLogoReact, BiLogoRedux, BiLogoTailwindCss],
    description: "A responsive blogging platform with user authentication, rich text editor, categories, and comment system.",
    github: "https://github.com/dharmik2910/",
    demo: "https://vtrack-expen.vercel.app",
  }
];

export default ProjectsData;
