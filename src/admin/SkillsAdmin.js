import React, { useMemo, useState } from "react";
import { FiArrowDown, FiArrowUp, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { TECH_ICONS, resolveIcon } from "../lib/icons";
import { readableBrandColor } from "../lib/scroll";
import { useTheme } from "../lib/theme";
import { api } from "./api";
import { Button, Card, Field, IconButton, IconPicker, Modal, TextInput, inputCls, move } from "./ui";

const SkillEditor = ({ skill, categories, onClose, onSaved }) => {
  const { theme } = useTheme();
  const [draft, setDraft] = useState({ name: "", icon: "", color: "#ff5823", category: categories[0] || "Other", ...skill });
  const [saving, setSaving] = useState(false);
  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const saved = skill?.id
        ? await api("skills", { method: "PUT", query: { id: skill.id }, body: draft })
        : await api("skills", { method: "POST", body: draft });
      onSaved(saved);
      toast.success(skill?.id ? "Skill updated" : "Skill added");
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={skill?.id ? "Edit skill" : "New skill"}
      onClose={onClose}
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !draft.name.trim()}>
            {saving ? "Saving…" : "Save skill"}
          </Button>
        </>
      }
    >
      <TextInput label="Name" value={draft.name} onChange={(e) => set("name")(e.target.value)} autoFocus />
      <Field label="Category" hint="Pick an existing one or type a new name to create a category.">
        <input list="skill-categories" className={inputCls} value={draft.category} onChange={(e) => set("category")(e.target.value)} />
        <datalist id="skill-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <IconPicker label="Icon" icons={TECH_ICONS} value={draft.icon} onChange={set("icon")} color={readableBrandColor(draft.color, theme)} />
      <Field label="Brand color" hint="Very dark colors are shown in cream on the dark site.">
        <div className="flex gap-3">
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(draft.color) ? draft.color : "#000000"}
            onChange={(e) => set("color")(e.target.value)}
            className="h-12 w-16 cursor-pointer rounded-xl border border-cream/10 bg-ink p-1"
          />
          <input className={inputCls} value={draft.color} onChange={(e) => set("color")(e.target.value)} placeholder="#ff5823" />
        </div>
      </Field>
    </Modal>
  );
};

const SkillsAdmin = ({ skills, setSkills }) => {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(null);
  const categories = useMemo(() => [...new Set(skills.map((s) => s.category))], [skills]);

  const onSaved = (saved) =>
    setSkills((list) => (list.some((s) => s.id === saved.id) ? list.map((s) => (s.id === saved.id ? saved : s)) : [...list, saved]));

  // Nearest skill in the same category in the given direction (-1 if none).
  const neighbour = (index, delta) => {
    for (let j = index + delta; j >= 0 && j < skills.length; j += delta) {
      if (skills[j].category === skills[index].category) return j;
    }
    return -1;
  };

  const reorder = async (index, delta) => {
    const target = neighbour(index, delta);
    if (target < 0) return;
    const next = move(skills, index, target - index);
    const previous = skills;
    setSkills(next);
    try {
      await api("skills", { method: "PATCH", body: { order: next.map((s) => s.id) } });
    } catch (err) {
      setSkills(previous);
      toast.error(err.message);
    }
  };

  const remove = async (skill) => {
    if (!window.confirm(`Delete “${skill.name}”?`)) return;
    try {
      await api("skills", { method: "DELETE", query: { id: skill.id } });
      setSkills((list) => list.filter((s) => s.id !== skill.id));
      toast.success("Skill deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Card
      title={`Skills (${skills.length})`}
      description="Grouped by category on the site; order within each group follows this list."
      actions={
        <Button onClick={() => setEditing({})}>
          <FiPlus /> New skill
        </Button>
      }
    >
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-cream-dim">{category}</h3>
            <ul className="grid gap-2 md:grid-cols-2">
              {skills.map((s, i) => {
                if (s.category !== category) return null;
                const Icon = resolveIcon(s.icon);
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-cream/10 bg-ink/60 py-2 pl-4 pr-2">
                    <Icon className="shrink-0 text-xl" style={{ color: readableBrandColor(s.color, theme) }} />
                    <span className="min-w-0 flex-1 truncate text-cream">{s.name}</span>
                    <IconButton label="Move up" disabled={neighbour(i, -1) < 0} onClick={() => reorder(i, -1)}>
                      <FiArrowUp />
                    </IconButton>
                    <IconButton label="Move down" disabled={neighbour(i, 1) < 0} onClick={() => reorder(i, 1)}>
                      <FiArrowDown />
                    </IconButton>
                    <IconButton label="Edit" onClick={() => setEditing(s)}>
                      <FiEdit2 />
                    </IconButton>
                    <IconButton label="Delete" className="hover:!text-red-300" onClick={() => remove(s)}>
                      <FiTrash2 />
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {!skills.length && <p className="py-10 text-center text-cream-mute">No skills yet.</p>}
      </div>
      {editing && <SkillEditor skill={editing} categories={categories} onClose={() => setEditing(null)} onSaved={onSaved} />}
    </Card>
  );
};

export default SkillsAdmin;
