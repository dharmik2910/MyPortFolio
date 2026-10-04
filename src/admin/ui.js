import React, { useMemo, useRef, useState } from "react";
import { FiArrowDown, FiArrowUp, FiPlus, FiSearch, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { iconLabel, resolveIcon } from "../lib/icons";
import { uploadImage } from "./api";

export const inputCls =
  "w-full rounded-xl border border-cream/10 bg-ink px-4 py-3 text-cream placeholder:text-cream-mute outline-none transition focus:border-ember/70 focus:ring-2 focus:ring-ember/20";

export const Button = ({ variant = "primary", className = "", children, ...props }) => {
  const styles = {
    primary: "bg-ember text-ink hover:bg-ember-soft",
    ghost: "border border-cream/15 text-cream hover:border-cream/40 hover:bg-cream/5",
    danger: "border border-red-400/30 text-red-300 hover:bg-red-500/10",
    subtle: "text-cream-dim hover:bg-cream/5 hover:text-cream",
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const IconButton = ({ label, className = "", children, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream-dim transition hover:bg-cream/10 hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const Card = ({ title, description, actions, children, className = "" }) => (
  <section className={`rounded-3xl border border-cream/10 bg-ink-800/70 p-5 md:p-7 ${className}`}>
    {(title || actions) && (
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          {title && <h2 className="font-display text-xl font-bold text-cream">{title}</h2>}
          {description && <p className="mt-1 text-sm text-cream-dim">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
    )}
    {children}
  </section>
);

export const Field = ({ label, hint, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-cream-dim">{label}</span>
    {children}
    {hint && <span className="mt-1.5 block text-xs text-cream-mute">{hint}</span>}
  </label>
);

export const TextInput = ({ label, hint, className, ...props }) => (
  <Field label={label} hint={hint} className={className}>
    <input className={inputCls} {...props} />
  </Field>
);

export const TextArea = ({ label, hint, className, rows = 4, ...props }) => (
  <Field label={label} hint={hint} className={className}>
    <textarea rows={rows} className={`${inputCls} resize-y leading-relaxed`} {...props} />
  </Field>
);

export const Toggle = ({ label, hint, checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-cream/10 bg-ink px-4 py-3 text-left"
  >
    <span>
      <span className="block text-sm font-medium text-cream">{label}</span>
      {hint && <span className="block text-xs text-cream-mute">{hint}</span>}
    </span>
    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-ember" : "bg-cream/15"}`}>
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </span>
  </button>
);

export const move = (arr, index, delta) => {
  const next = [...arr];
  const target = index + delta;
  if (target < 0 || target >= next.length) return arr;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

// Generic ordered list editor: renderItem(item, onChange) draws one row's inputs.
export const ListEditor = ({ label, items, onChange, renderItem, newItem, addLabel = "Add", max = 20 }) => (
  <div>
    {label && <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-cream-dim">{label}</span>}
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <div className="min-w-0 flex-1">{renderItem(item, (val) => onChange(items.map((x, j) => (j === i ? val : x))), i)}</div>
          <div className="flex shrink-0 pt-1.5">
            <IconButton label="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, -1))}>
              <FiArrowUp />
            </IconButton>
            <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))}>
              <FiArrowDown />
            </IconButton>
            <IconButton label="Remove" className="hover:!text-red-300" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <FiTrash2 />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
    {items.length < max && (
      <Button variant="subtle" className="mt-2 !px-3" onClick={() => onChange([...items, newItem()])}>
        <FiPlus /> {addLabel}
      </Button>
    )}
  </div>
);

export const StringList = ({ label, items, onChange, placeholder, multiline = false, addLabel }) => (
  <ListEditor
    label={label}
    items={items}
    onChange={onChange}
    newItem={() => ""}
    addLabel={addLabel}
    renderItem={(value, set) =>
      multiline ? (
        <textarea rows={3} className={`${inputCls} resize-y`} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} />
      ) : (
        <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} />
      )
    }
  />
);

/**
 * Searchable icon grid. `value` is a name (single) or array of names (multiple).
 */
export const IconPicker = ({ label, icons, value, onChange, multiple = false, color }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = multiple ? value : value ? [value] : [];
  const names = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.keys(icons).filter((n) => !q || n.toLowerCase().includes(q));
  }, [icons, query]);

  const toggle = (name) => {
    if (multiple) onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);
    else {
      onChange(name);
      setOpen(false);
    }
  };

  return (
    <div>
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-cream-dim">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((name) => {
          const Icon = resolveIcon(name);
          return (
            <span key={name} className="inline-flex items-center gap-2 rounded-full border border-cream/10 bg-ink py-1.5 pl-3 pr-1.5 text-sm text-cream">
              <Icon style={color ? { color } : undefined} className="text-lg" />
              {iconLabel(name)}
              {multiple && (
                <button type="button" aria-label={`Remove ${iconLabel(name)}`} onClick={() => toggle(name)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-cream/10">
                  <FiX />
                </button>
              )}
            </span>
          );
        })}
        <Button variant="ghost" className="!px-3 !py-1.5" onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : multiple ? "Add icons" : selected.length ? "Change" : "Choose icon"}
        </Button>
      </div>
      {open && (
        <div className="mt-3 rounded-2xl border border-cream/10 bg-ink p-3">
          <div className="relative mb-3">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-mute" />
            <input autoFocus className={`${inputCls} !py-2 pl-10`} placeholder="Search icons…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="grid max-h-64 grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-1.5 overflow-y-auto">
            {names.map((name) => {
              const Icon = icons[name];
              const on = selected.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => toggle(name)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-[10px] transition ${
                    on ? "border-ember bg-ember/10 text-cream" : "border-transparent text-cream-dim hover:bg-cream/5"
                  }`}
                >
                  <Icon className="text-xl" />
                  <span className="w-full truncate">{iconLabel(name)}</span>
                </button>
              );
            })}
            {!names.length && <p className="col-span-full p-3 text-sm text-cream-mute">No icons match “{query}”.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export const ImageInput = ({ label, value, onChange, hint, aspect = "aspect-[16/10]", fallbackSrc }) => {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-cream-dim">{label}</span>
      <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
        <div className={`${aspect} overflow-hidden rounded-xl border border-cream/10 bg-ink`}>
          {value || fallbackSrc ? (
            <img src={value || fallbackSrc} alt="" className="h-full w-full object-cover object-top" />
          ) : (
            <div className="grid h-full place-items-center text-xs text-cream-mute">No image</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input className={inputCls} value={value} placeholder="https://… or /image.png" onChange={(e) => onChange(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
              <FiUpload /> {busy ? "Uploading…" : "Upload image"}
            </Button>
            {value && (
              <Button variant="subtle" onClick={() => onChange("")}>
                Clear
              </Button>
            )}
          </div>
          {hint && <span className="text-xs text-cream-mute">{hint}</span>}
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onFile} />
        </div>
      </div>
    </div>
  );
};

export const Modal = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={onClose}>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.stopPropagation()}
      className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl border border-cream/10 bg-ink-800 sm:rounded-3xl"
    >
      <header className="flex items-center justify-between border-b border-cream/10 px-6 py-4">
        <h2 className="font-display text-lg font-bold text-cream">{title}</h2>
        <IconButton label="Close" onClick={onClose}>
          <FiX />
        </IconButton>
      </header>
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">{children}</div>
      {footer && <footer className="flex justify-end gap-2 border-t border-cream/10 px-6 py-4">{footer}</footer>}
    </div>
  </div>
);

// Sticky save bar shown on settings forms when there are unsaved edits.
export const SaveBar = ({ dirty, saving, onSave, onReset }) => (
  <div
    className={`sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-full border border-cream/10 bg-ink-700/95 py-2 pl-5 pr-2 shadow-2xl backdrop-blur transition ${
      dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
    }`}
  >
    <span className="text-sm text-cream-dim">You have unsaved changes</span>
    <div className="flex gap-2">
      <Button variant="subtle" onClick={onReset} disabled={saving}>
        Discard
      </Button>
      <Button onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  </div>
);
