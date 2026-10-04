import { useEffect, useState } from "react";
import Lenis from "lenis";
import "./App.css";
import About from "./components/About";
import Contact from "./components/Contact";
import Cursor from "./components/Cursor";
import Footer from "./components/Footer";
import Marquee from "./components/Marquee";
import Navbar from "./components/Navbar";
import Preloader from "./components/Preloader";
import Profile from "./components/Profile";
import Projects from "./components/Projects";
import ScrollToTopButton from "./components/ScrollToTop";
import Skills from "./components/Skills";
import useReveal from "./hooks/useReveal";
import { getLenis, prefersReducedMotion, setLenis } from "./lib/scroll";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContent } from "./lib/ContentContext";
import { useTheme } from "./lib/theme";

function App() {
  const { skills: SkillsData } = useContent();
  const { theme } = useTheme();
  const [loaded, setLoaded] = useState(false);

  useReveal();

  // Smooth scrolling (skipped for reduced-motion users)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    setLenis(lenis);
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Lock scrolling while the preloader is up
  useEffect(() => {
    const lenis = getLenis();
    document.documentElement.style.overflow = loaded ? "" : "hidden";
    if (lenis) loaded ? lenis.start() : lenis.stop();
  }, [loaded]);

  return (
    <div className={`App ${loaded ? "loaded" : ""}`}>
      <Preloader onDone={() => setLoaded(true)} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main>
        <Profile />
        <Marquee
          items={SkillsData.slice(0, 12).map((s) => s.name)}
          className="-rotate-2 scale-[1.04] bg-ember py-4 text-ink"
        />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <ScrollToTopButton />
      <ToastContainer theme={theme} position="bottom-left" />
    </div>
  );
}

export default App;
