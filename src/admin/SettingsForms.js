import React, { useState } from "react";
import { toast } from "react-toastify";
import { SOCIAL_ICONS } from "../lib/icons";
import { api } from "./api";
import { Card, IconPicker, ListEditor, SaveBar, StringList, TextArea, TextInput, Toggle, inputCls } from "./ui";

// Draft/dirty/save plumbing shared by the three settings forms.
const useSettingsForm = (key, initial, onSaved) => {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const { value } = await api("settings", { method: "PUT", body: { key, value: draft } });
      onSaved(key, value);
      setDraft(value);
      toast.success("Saved — the live site updates within a few seconds");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return { draft, set, dirty, saving, save, reset: () => setDraft(initial) };
};

export const ProfileForm = ({ value, onSaved }) => {
  const f = useSettingsForm("profile", value, onSaved);
  const { draft, set } = f;
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Identity" description="Shown in the hero, navbar and footer.">
          <div className="space-y-5">
            <TextInput label="Full name" value={draft.name} onChange={(e) => set("name")(e.target.value)} />
            <TextInput
              label="Resume link"
              type="url"
              value={draft.resume}
              onChange={(e) => set("resume")(e.target.value)}
              placeholder="https://drive.google.com/…"
            />
            <Toggle
              label="Available for work"
              hint="Shows the green “Available for work” badge in the hero."
              checked={draft.available}
              onChange={set("available")}
            />
          </div>
        </Card>
        <Card title="Hero copy">
          <div className="space-y-6">
            <StringList
              label="Rotating professions"
              items={draft.professions}
              onChange={set("professions")}
              placeholder="Full Stack Developer"
              addLabel="Add profession"
            />
            <StringList label="Intro lines" items={draft.info} onChange={set("info")} placeholder="One short sentence" addLabel="Add line" />
          </div>
        </Card>
      </div>
      <SaveBar dirty={f.dirty} saving={f.saving} onSave={f.save} onReset={f.reset} />
    </>
  );
};

export const AboutForm = ({ value, onSaved }) => {
  const f = useSettingsForm("about", value, onSaved);
  const { draft, set } = f;
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Story" description="The big statement lights up word-by-word as visitors scroll.">
          <div className="space-y-6">
            <TextArea label="Statement" rows={3} value={draft.statement} onChange={(e) => set("statement")(e.target.value)} />
            <StringList label="Paragraphs" multiline items={draft.description} onChange={set("description")} addLabel="Add paragraph" />
          </div>
        </Card>
        <Card title="Services" description="The rows that fill orange on hover.">
          <ListEditor
            items={draft.services}
            onChange={set("services")}
            newItem={() => ({ title: "", text: "" })}
            addLabel="Add service"
            max={8}
            renderItem={(s, update) => (
              <div className="space-y-2 rounded-2xl border border-cream/10 p-3">
                <input className={inputCls} placeholder="Title" value={s.title} onChange={(e) => update({ ...s, title: e.target.value })} />
                <textarea
                  rows={2}
                  className={`${inputCls} resize-y`}
                  placeholder="One-line description"
                  value={s.text}
                  onChange={(e) => update({ ...s, text: e.target.value })}
                />
              </div>
            )}
          />
        </Card>
      </div>
      <SaveBar dirty={f.dirty} saving={f.saving} onSave={f.save} onReset={f.reset} />
    </>
  );
};

export const ContactForm = ({ value, onSaved }) => {
  const f = useSettingsForm("contact", value, onSaved);
  const { draft, set } = f;
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Contact details">
          <div className="space-y-5">
            <TextInput label="Email" type="email" value={draft.email} onChange={(e) => set("email")(e.target.value)} />
            <TextInput label="Phone" value={draft.phone} onChange={(e) => set("phone")(e.target.value)} />
            <TextInput label="Location" value={draft.address} onChange={(e) => set("address")(e.target.value)} />
          </div>
        </Card>
        <Card title="Social links" description="Shown in the hero, contact section and footer.">
          <ListEditor
            items={draft.links}
            onChange={set("links")}
            newItem={() => ({ url: "", icon: "FaGlobe" })}
            addLabel="Add link"
            max={12}
            renderItem={(link, update) => (
              <div className="space-y-3 rounded-2xl border border-cream/10 p-3">
                <input
                  className={inputCls}
                  type="url"
                  placeholder="https://…"
                  value={link.url}
                  onChange={(e) => update({ ...link, url: e.target.value })}
                />
                <IconPicker label="Icon" icons={SOCIAL_ICONS} value={link.icon} onChange={(icon) => update({ ...link, icon })} />
              </div>
            )}
          />
        </Card>
      </div>
      <SaveBar dirty={f.dirty} saving={f.saving} onSave={f.save} onReset={f.reset} />
    </>
  );
};
