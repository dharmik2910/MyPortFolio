// Icons are stored by name (in the database and in src/data) and resolved here.
// To make a new icon available in the admin picker, import it and add it to a map below.
import {
  SiHtml5, SiCss3, SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiTailwindcss, SiRedux,
  SiNodedotjs, SiExpress, SiPostgresql, SiMongodb, SiMysql, SiPrisma, SiRedis, SiDocker, SiGit,
  SiGithub, SiGitlab, SiPostman, SiSocketdotio, SiPython, SiSap, SiVuedotjs, SiAngular, SiSvelte,
  SiFirebase, SiSupabase, SiVercel, SiNetlify, SiGraphql, SiKubernetes, SiFigma, SiSass,
  SiBootstrap, SiJquery, SiDjango, SiFlask, SiFastapi, SiNestjs, SiBun, SiVite, SiWebpack, SiJest,
  SiLinux, SiNginx, SiOpenai, SiStripe, SiCplusplus, SiGo, SiRust, SiPhp, SiLaravel, SiSqlite,
  SiFramer, SiThreedotjs, SiCloudflare, SiGooglecloud, SiMicrosoftazure, SiJira, SiNpm, SiYarn,
  SiPnpm, SiCypress, SiStorybook, SiElectron, SiFlutter, SiDart, SiKotlin, SiSwift, SiAndroid,
  SiTensorflow, SiPytorch, SiPandas, SiNumpy, SiWordpress, SiShopify, SiSanity, SiAuth0, SiTrpc,
  SiZod, SiReactquery, SiMui, SiChakraui, SiAntdesign, SiRadixui, SiElasticsearch, SiRabbitmq,
  SiApachekafka, SiTerraform, SiJenkins, SiGithubactions, SiHeroku, SiRender, SiRailway,
  SiDigitalocean, SiAmazons3, SiAwslambda, SiInsomnia, SiNotion,
} from "react-icons/si";
import {
  BiLogoReact, BiLogoRedux, BiLogoTailwindCss, BiLogoMongodb, BiLogoFirebase, BiLogoHtml5,
  BiLogoCss3, BiLogoJavascript, BiLogoTypescript, BiLogoNodejs,
} from "react-icons/bi";
import { TbApi, TbBrandNextjs, TbBrandPrisma, TbBrandVscode, TbBrandNodejs } from "react-icons/tb";
import {
  FaGithub, FaLinkedin, FaInstagram, FaYoutube, FaDribbble, FaBehance, FaMedium, FaDev,
  FaStackOverflow, FaFacebook, FaDiscord, FaTelegram, FaWhatsapp, FaGlobe, FaEnvelope, FaCodepen,
  FaHackerrank, FaJava,
} from "react-icons/fa";
import { FaAws, FaXTwitter, FaThreads } from "react-icons/fa6";

export const TECH_ICONS = {
  SiHtml5, SiCss3, SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiTailwindcss, SiRedux,
  SiNodedotjs, SiExpress, SiPostgresql, SiMongodb, SiMysql, SiPrisma, SiRedis, SiDocker, SiGit,
  SiGithub, SiGitlab, SiPostman, SiSocketdotio, SiPython, SiSap, SiVuedotjs, SiAngular, SiSvelte,
  SiFirebase, SiSupabase, SiVercel, SiNetlify, SiGraphql, SiKubernetes, SiFigma, SiSass,
  SiBootstrap, SiJquery, SiDjango, SiFlask, SiFastapi, SiNestjs, SiBun, SiVite, SiWebpack, SiJest,
  SiLinux, SiNginx, SiOpenai, SiStripe, SiCplusplus, SiGo, SiRust, SiPhp, SiLaravel, SiSqlite,
  SiFramer, SiThreedotjs, SiCloudflare, SiGooglecloud, SiMicrosoftazure, SiJira, SiNpm, SiYarn,
  SiPnpm, SiCypress, SiStorybook, SiElectron, SiFlutter, SiDart, SiKotlin, SiSwift, SiAndroid,
  SiTensorflow, SiPytorch, SiPandas, SiNumpy, SiWordpress, SiShopify, SiSanity, SiAuth0, SiTrpc,
  SiZod, SiReactquery, SiMui, SiChakraui, SiAntdesign, SiRadixui, SiElasticsearch, SiRabbitmq,
  SiApachekafka, SiTerraform, SiJenkins, SiGithubactions, SiHeroku, SiRender, SiRailway,
  SiDigitalocean, SiAmazons3, SiAwslambda, SiInsomnia, SiNotion,
  BiLogoReact, BiLogoRedux, BiLogoTailwindCss, BiLogoMongodb, BiLogoFirebase, BiLogoHtml5,
  BiLogoCss3, BiLogoJavascript, BiLogoTypescript, BiLogoNodejs,
  TbApi, TbBrandNextjs, TbBrandPrisma, TbBrandVscode, TbBrandNodejs,
  FaAws, FaJava,
};

export const SOCIAL_ICONS = {
  FaGithub, FaLinkedin, FaInstagram, FaXTwitter, FaThreads, FaYoutube, FaDribbble, FaBehance,
  FaMedium, FaDev, FaStackOverflow, FaFacebook, FaDiscord, FaTelegram, FaWhatsapp, FaCodepen,
  FaHackerrank, FaGlobe, FaEnvelope,
};

const ALL = { ...TECH_ICONS, ...SOCIAL_ICONS };

// "SiNextdotjs" -> "Nextdotjs", "BiLogoReact" -> "React" — used as a readable label/tooltip.
export const iconLabel = (name = "") =>
  name.replace(/^(Si|Bi|Tb|Fa)(Logo|Brand)?/, "").replace(/dotjs$/i, ".js");

export const resolveIcon = (name) => ALL[name] || TbApi;
