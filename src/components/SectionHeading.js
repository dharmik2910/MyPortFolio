import React from "react";

// Shared section header: numbered mono label + big masked-line title.
const SectionHeading = ({ index, label, title, accent, className = "" }) => (
  <div className={`mb-14 md:mb-20 ${className}`}>
    <p data-reveal="fade" className="section-label mb-6">
      ({index}) {label}
    </p>
    <h2
      data-reveal="lines"
      className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-[-0.03em] text-cream sm:text-6xl md:text-7xl lg:text-8xl"
    >
      <span className="line">
        <span>{title}</span>
      </span>
      {accent && (
        <span className="line">
          <span className="text-outline" style={{ "--d": "120ms" }}>
            {accent}
          </span>
        </span>
      )}
    </h2>
  </div>
);

export default SectionHeading;
