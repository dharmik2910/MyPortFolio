import React from "react";

// Infinite horizontal ticker. The track is rendered twice so the loop is seamless.
const Marquee = ({ items, reverse = false, speed = "35s", className = "", renderItem }) => {
  const render =
    renderItem ||
    ((item) => (
      <span className="flex items-center gap-8 whitespace-nowrap font-display text-2xl font-bold uppercase tracking-tight md:text-4xl">
        {item}
        <span aria-hidden="true" className="text-lg md:text-2xl">
          ✦
        </span>
      </span>
    ));

  return (
    <div
      className={`marquee relative z-10 ${reverse ? "marquee--reverse" : ""} ${className}`}
      style={{ "--speed": speed }}
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="marquee__track" aria-hidden={copy === 1}>
          {items.map((item, i) => (
            <React.Fragment key={i}>{render(item, i)}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Marquee;
