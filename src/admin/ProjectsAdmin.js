import React, { useState } from "react";
import { FiArrowDown, FiArrowUp, FiEdit2, FiExternalLink, FiGithub, FiPlus, FiStar, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { TECH_ICONS, resolveIcon } from "../lib/icons";
import { api } from "./api";
import {
  Button,
  Card,
  Field,
  IconButton,
  IconPicker,
  ImageInput,
  ListEditor,
  Modal,
  TextArea,
  TextInput,
  Toggle,
  inputCls,
  move,
} from "./ui";

const EMPTY = {
  name: "",
  description: "",
  image: "",
  github: "",
  demo: "",
  icons: [],
  featured: false,
  status: "",
  links: [],
};

export const STATUS_OPTIONS = [
  { value: "", label: "Live / finished" },
  { value: "in-progress", label: "In progress" },
  { value: "coming-soon", label: "Coming soon" },
];

const ProjectEditor = ({ project, onClose, onSaved }) => {
  const [draft, setDraft] = useState({ ...EMPTY, ...project });
  const [saving, setSaving] = useState(false);
  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const saved = project?.id
        ? await api("projects", { method: "PUT", query: { id: project.id }, body: draft })
        : await api("projects", { method: "POST", body: draft });
      onSaved(saved);
      toast.success(project?.id ? "Project updated" : "Project added");
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={project?.id ? "Edit project" : "New project"}
      onClose={onClose}
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !draft.name.trim()}>
            {saving ? "Saving…" : "Save project"}
          </Button>
        </>
      }
    >
      <TextInput label="Name" value={draft.name} onChange={(e) => set("name")(e.target.value)} autoFocus />
      <TextArea
        label="Description"
        rows={3}
        value={draft.description}
        onChange={(e) => set("description")(e.target.value)}
      />
      <ImageInput
        label="Cover image"
        value={draft.image}
        onChange={set("image")}
        hint="Wide screenshots (16:10) look best."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Live demo URL"
          type="url"
          value={draft.demo}
          onChange={(e) => set("demo")(e.target.value)}
          placeholder="https://… (optional)"
        />
        <TextInput
          label="GitHub URL"
          type="url"
          value={draft.github}
          onChange={(e) => set("github")(e.target.value)}
          placeholder="https://github.com/… (optional)"
        />
      </div>
      <ListEditor
        label="Extra links"
        items={draft.links}
        onChange={set("links")}
        newItem={() => ({ label: "", url: "", tag: "" })}
        addLabel="Add link"
        max={4}
        renderItem={(link, update) => (
          <div className="grid gap-2 rounded-2xl border border-cream/10 p-3 sm:grid-cols-2">
            <input
              className={inputCls}
              placeholder="Label, e.g. fynnchintan.in"
              value={link.label}
              onChange={(e) => update({ ...link, label: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Tag (optional), e.g. Coming soon"
              value={link.tag}
              onChange={(e) => update({ ...link, tag: e.target.value })}
            />
            <input
              className={`${inputCls} sm:col-span-2`}
              type="url"
              placeholder="https://…"
              value={link.url}
              onChange={(e) => update({ ...link, url: e.target.value })}
            />
          </div>
        )}
      />
      <Field label="Status" hint="Adds a badge on the project card.">
        <select className={inputCls} value={draft.status} onChange={(e) => set("status")(e.target.value)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <IconPicker label="Tech stack" icons={TECH_ICONS} value={draft.icons} onChange={set("icons")} multiple />
      <Toggle
        label="Featured project"
        hint="Shown large at the top of the projects section. Only one project can be featured."
        checked={draft.featured}
        onChange={set("featured")}
      />
    </Modal>
  );
};

const ProjectsAdmin = ({ projects, setProjects }) => {
  const [editing, setEditing] = useState(null); // null | {} (new) | project

  const onSaved = (saved) =>
    setProjects((list) => {
      const exists = list.some((p) => p.id === saved.id);
      const next = exists ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list];
      return saved.featured ? next.map((p) => (p.id === saved.id ? p : { ...p, featured: false })) : next;
    });

  const reorder = async (index, delta) => {
    const next = move(projects, index, delta);
    if (next === projects) return;
    const previous = projects;
    setProjects(next);
    try {
      await api("projects", { method: "PATCH", body: { order: next.map((p) => p.id) } });
    } catch (err) {
      setProjects(previous);
      toast.error(err.message);
    }
  };

  const remove = async (project) => {
    if (!window.confirm(`Delete “${project.name}”? This can't be undone.`)) return;
    try {
      await api("projects", { method: "DELETE", query: { id: project.id } });
      setProjects((list) => list.filter((p) => p.id !== project.id));
      toast.success("Project deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Card
      title={`Projects (${projects.length})`}
      description="Order here is the order on the site."
      actions={
        <Button onClick={() => setEditing({})}>
          <FiPlus /> New project
        </Button>
      }
    >
      <ul className="space-y-3">
        {projects.map((p, i) => (
          <li
            key={p.id}
            className="flex flex-col gap-4 rounded-2xl border border-cream/10 bg-ink/60 p-3 sm:flex-row sm:items-center"
          >
            <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-ink-700 sm:w-36">
              {p.image && <img src={p.image} alt="" className="h-full w-full object-cover object-top" loading="lazy" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {p.featured && <FiStar className="shrink-0 fill-ember text-ember" title="Featured" />}
                <h3 className="truncate font-semibold text-cream">{p.name}</h3>
                {p.status && (
                  <span className="shrink-0 rounded-full bg-ember/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ember">
                    {STATUS_OPTIONS.find((o) => o.value === p.status)?.label}
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-cream-dim">{p.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-cream-mute">
                {p.icons.map((name) => {
                  const Icon = resolveIcon(name);
                  return <Icon key={name} title={name} />;
                })}
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex items-center gap-1 text-xs hover:text-cream"
                  >
                    <FiExternalLink /> Demo
                  </a>
                )}
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:text-cream"
                  >
                    <FiGithub /> Code
                  </a>
                )}
                {(p.links || []).map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:text-cream"
                  >
                    <FiExternalLink /> {l.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end">
              <IconButton label="Move up" disabled={i === 0} onClick={() => reorder(i, -1)}>
                <FiArrowUp />
              </IconButton>
              <IconButton label="Move down" disabled={i === projects.length - 1} onClick={() => reorder(i, 1)}>
                <FiArrowDown />
              </IconButton>
              <IconButton label="Edit" onClick={() => setEditing(p)}>
                <FiEdit2 />
              </IconButton>
              <IconButton label="Delete" className="hover:!text-red-300" onClick={() => remove(p)}>
                <FiTrash2 />
              </IconButton>
            </div>
          </li>
        ))}
        {!projects.length && <p className="py-10 text-center text-cream-mute">No projects yet.</p>}
      </ul>
      {editing && <ProjectEditor project={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}
    </Card>
  );
};

export default ProjectsAdmin;
