import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiArrowUpRight, FiBriefcase, FiCpu, FiGrid, FiInbox, FiLock, FiLogOut, FiPhone, FiUser, FiFileText,
} from "react-icons/fi";
import { api, getToken, setToken, UNAUTHORIZED_EVENT } from "./api";
import { useTheme } from "../lib/theme";
import { Button, Card, inputCls } from "./ui";
import { AboutForm, ContactForm, ProfileForm } from "./SettingsForms";
import ProjectsAdmin from "./ProjectsAdmin";
import SkillsAdmin from "./SkillsAdmin";
import MessagesAdmin, { formatDate } from "./MessagesAdmin";

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid },
  { id: "messages", label: "Inbox", icon: FiInbox },
  { id: "projects", label: "Projects", icon: FiBriefcase },
  { id: "skills", label: "Skills", icon: FiCpu },
  { id: "profile", label: "Profile", icon: FiUser },
  { id: "about", label: "About", icon: FiFileText },
  { id: "contact", label: "Contact", icon: FiPhone },
];

// Make sure every list field exists so forms never crash on partially-filled rows.
const normalize = (raw) => ({
  profile: { name: "", img: "", resume: "", available: true, ...raw.profile, professions: raw.profile?.professions || [], info: raw.profile?.info || [] },
  about: { statement: "", ...raw.about, description: raw.about?.description || [], services: raw.about?.services || [] },
  contact: { email: "", phone: "", address: "", ...raw.contact, links: raw.contact?.links || [] },
  projects: raw.projects || [],
  skills: raw.skills || [],
});

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { token } = await api("login", { method: "POST", body: { password } });
      setToken(token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,rgba(255,88,35,0.15),transparent_60%)] px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-cream/10 bg-ink-800/80 p-8 backdrop-blur">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ember text-ink">
          <FiLock className="text-xl" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-cream">Admin</h1>
        <p className="mt-1 text-sm text-cream-dim">Sign in to manage your portfolio.</p>
        <label className="mt-8 block">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-cream-dim">Password</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        <Button type="submit" className="mt-6 w-full !py-3" disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <a href="/" className="mt-6 block text-center text-sm text-cream-mute hover:text-cream">
          ← Back to site
        </a>
      </form>
    </div>
  );
};

const Dashboard = ({ data, messages, go }) => {
  const unread = messages.filter((m) => !m.is_read);
  const stats = [
    { label: "Projects", value: data.projects.length, to: "projects" },
    { label: "Skills", value: data.skills.length, to: "skills" },
    { label: "Messages", value: messages.length, to: "messages" },
    { label: "Unread", value: unread.length, to: "messages", accent: unread.length > 0 },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => go(s.to)}
            className="rounded-3xl border border-cream/10 bg-ink-800/70 p-5 text-left transition hover:border-ember/40"
          >
            <span className={`block font-display text-4xl font-bold ${s.accent ? "text-ember" : "text-cream"}`}>{s.value}</span>
            <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-cream-dim">{s.label}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Latest messages" actions={<Button variant="ghost" onClick={() => go("messages")}>Open inbox</Button>}>
          <ul className="space-y-3">
            {messages.slice(0, 4).map((m) => (
              <li key={m.id} className="rounded-2xl border border-cream/10 bg-ink/60 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className={m.is_read ? "text-cream-dim" : "font-semibold text-cream"}>{m.name}</span>
                  <span className="font-mono text-[11px] text-cream-mute">{formatDate(m.created_at)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-cream-dim">{m.message}</p>
              </li>
            ))}
            {!messages.length && <p className="text-cream-mute">Nothing yet — messages from the contact form will appear here.</p>}
          </ul>
        </Card>
        <Card title="Quick edits">
          <div className="grid gap-2 sm:grid-cols-2">
            {SECTIONS.filter((s) => s.id !== "dashboard").map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className="flex items-center gap-3 rounded-2xl border border-cream/10 bg-ink/60 px-4 py-4 text-left text-cream transition hover:border-ember/40"
              >
                <s.icon className="text-ember" /> {s.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const Shell = ({ onLogout }) => {
  const initial = window.location.hash.replace("#", "");
  const [section, setSection] = useState(SECTIONS.some((s) => s.id === initial) ? initial : "dashboard");
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [content, inbox] = await Promise.all([api("content", { query: { fresh: Date.now() } }), api("messages")]);
      setData(normalize(content));
      setMessages(inbox.messages);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const go = (id) => {
    setSection(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo(0, 0);
  };

  const setList = (key) => (updater) =>
    setData((d) => ({ ...d, [key]: typeof updater === "function" ? updater(d[key]) : updater }));
  const onSettingsSaved = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const unread = messages.filter((m) => !m.is_read).length;
  const current = SECTIONS.find((s) => s.id === section);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar (top bar on small screens) */}
      <aside className="sticky top-0 z-30 border-b border-cream/10 bg-ink-800/95 backdrop-blur lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <a href="/" className="flex items-center gap-2 font-display text-lg font-bold text-cream">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ember text-xs text-ink">DR</span>
            Admin
          </a>
          <button onClick={onLogout} aria-label="Log out" className="text-cream-dim hover:text-cream lg:hidden">
            <FiLogOut />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3" aria-label="Admin sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              aria-current={section === s.id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                section === s.id ? "bg-cream text-ink" : "text-cream-dim hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <s.icon />
              {s.label}
              {s.id === "messages" && unread > 0 && (
                <span className="ml-auto rounded-full bg-ember px-2 py-0.5 text-[11px] font-bold text-ink">{unread}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="absolute inset-x-3 bottom-4 hidden space-y-1 lg:block">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-cream-dim hover:bg-cream/5 hover:text-cream">
            <FiArrowUpRight /> View site
          </a>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-cream-dim hover:bg-cream/5 hover:text-cream">
            <FiLogOut /> Log out
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 lg:py-10">
        <h1 className="mb-8 font-display text-3xl font-bold text-cream md:text-4xl">{current.label}</h1>
        {error && (
          <Card title="Couldn't load data" description={error}>
            <Button onClick={load}>Retry</Button>
          </Card>
        )}
        {!data && !error && <p className="text-cream-dim">Loading…</p>}
        {data && (
          <>
            {section === "dashboard" && <Dashboard data={data} messages={messages} go={go} />}
            {section === "messages" && <MessagesAdmin messages={messages} setMessages={setMessages} />}
            {section === "projects" && <ProjectsAdmin projects={data.projects} setProjects={setList("projects")} />}
            {section === "skills" && <SkillsAdmin skills={data.skills} setSkills={setList("skills")} />}
            {section === "profile" && <ProfileForm value={data.profile} onSaved={onSettingsSaved} />}
            {section === "about" && <AboutForm value={data.about} onSaved={onSettingsSaved} />}
            {section === "contact" && <ContactForm value={data.contact} onSaved={onSettingsSaved} />}
          </>
        )}
      </main>
    </div>
  );
};

const Admin = () => {
  const { theme } = useTheme();
  const [authed, setAuthed] = useState(null); // null = checking

  useEffect(() => {
    document.title = "Admin · Portfolio";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);

    if (!getToken()) setAuthed(false);
    else api("login").then((r) => setAuthed(Boolean(r?.ok))).catch(() => setAuthed(false));

    const onUnauthorized = () => setAuthed(false);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const logout = () => {
    setToken(null);
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-ink font-sans text-cream">
      {authed === null && <p className="p-8 text-cream-dim">Loading…</p>}
      {authed === false && <Login onLogin={() => setAuthed(true)} />}
      {authed && <Shell onLogout={logout} />}
      <ToastContainer theme={theme} position="bottom-right" />
    </div>
  );
};

export default Admin;
