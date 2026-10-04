import React from "react";

// Brand icons live in a separate chunk (./icons) so the main bundle stays small.
// Webpack keeps a single copy of each react-icons pack with every icon used anywhere,
// so importing them statically here would also ship the admin's full picker set.
let registry = null;
let loading = null;

export const loadIcons = () => {
  if (!loading) loading = import("./icons").then((m) => (registry = m));
  return loading;
};

// Same footprint as an icon, so layout doesn't shift when the chunk arrives.
const Placeholder = ({ className, style }) => (
  <span aria-hidden="true" className={className} style={{ display: "inline-block", width: "1em", height: "1em", ...style }} />
);

export const resolveIcon = (name) => (registry ? registry.resolveIcon(name) : Placeholder);
