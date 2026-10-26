import React, { useCallback, useEffect, useState } from "react";
import { FiMonitor, FiRefreshCw, FiSmartphone, FiTablet } from "react-icons/fi";
import { api } from "./api";
import { Button, Card } from "./ui";
import { useTheme } from "../lib/theme";

const RANGES = [7, 30, 90];

// Ember passes 3:1 on the dark surface; light mode needs a deeper step (validated).
const BAR = { dark: "#FF5823", light: "#D9461A" };

const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

export const countryName = (code) => {
  if (!code || code === "??") return "Unknown";
  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
};

export const flag = (code) =>
  /^[A-Z]{2}$/.test(code || "") ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "🌐";

const fmt = new Intl.NumberFormat("en-IN");
const dayLabel = (iso, opts = { day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat("en-IN", opts).format(new Date(`${iso}T00:00:00`));

export const timeAgo = (iso) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso)) / 1000));
  if (s < 60) return "just now";
  const units = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [u, n] of units) if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  return "just now";
};

const DeviceIcon = ({ type }) => {
  const Icon = type === "Mobile" ? FiSmartphone : type === "Tablet" ? FiTablet : FiMonitor;
  return <Icon className="shrink-0 text-cream-mute" aria-hidden="true" />;
};

const Stat = ({ label, value, hint }) => (
  <div className="rounded-3xl border border-cream/10 bg-ink-800/70 p-5">
    <span className="block font-display text-4xl font-bold text-cream">{fmt.format(value ?? 0)}</span>
    <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-cream-dim">{label}</span>
    {hint && <span className="mt-1 block text-xs text-cream-mute">{hint}</span>}
  </div>
);

// Views per day: thin bars on a recessive grid, a tooltip per column, and a table view.
const DailyChart = ({ daily, color }) => {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...daily.map((d) => d.views));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [top, top / 2, 0];
  const labelEvery = Math.ceil(daily.length / 6);

  return (
    <div>
      <div className="relative flex h-52 gap-3">
        <div className="flex w-8 shrink-0 flex-col justify-between pb-6 text-right font-mono text-[11px] text-cream-mute">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {fmt.format(Math.round(t))}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <span key={t} className={`block border-t ${t === 0 ? "border-cream/25" : "border-dashed border-cream/10"}`} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-stretch gap-[2px]" onMouseLeave={() => setHover(null)}>
            {daily.map((d, i) => (
              <button
                type="button"
                key={d.day}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${dayLabel(d.day)}: ${d.views} views, ${d.visitors} visitors`}
                className="group relative flex flex-1 flex-col justify-end pb-6 outline-none"
              >
                <span
                  className="block w-full rounded-t-[4px] transition-opacity"
                  style={{
                    height: `${(d.views / top) * 100}%`,
                    minHeight: d.views ? 2 : 0,
                    background: color,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                />
                <span className="absolute bottom-0 left-1/2 h-6 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] leading-6 text-cream-mute">
                  {i % labelEvery === 0 || i === daily.length - 1 ? dayLabel(d.day) : ""}
                </span>
              </button>
            ))}
          </div>
          {hover !== null && daily[hover] && (
            <div
              className="pointer-events-none absolute -top-2 z-10 w-max -translate-x-1/2 -translate-y-full rounded-xl border border-cream/15 bg-ink px-3 py-2 text-xs shadow-lg"
              style={{ left: `${((hover + 0.5) / daily.length) * 100}%` }}
            >
              <span className="block font-mono text-[11px] text-cream-mute">
                {dayLabel(daily[hover].day, { weekday: "short", day: "numeric", month: "short" })}
              </span>
              <span className="block text-cream">
                <b className="font-semibold">{fmt.format(daily[hover].views)}</b> views ·{" "}
                <b className="font-semibold">{fmt.format(daily[hover].visitors)}</b> visitors
              </span>
            </div>
          )}
        </div>
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-cream-dim hover:text-cream">Show as table</summary>
        <div className="mt-3 max-h-64 overflow-auto rounded-2xl border border-cream/10">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-ink-800 font-mono text-[11px] uppercase tracking-[0.14em] text-cream-dim">
              <tr>
                <th className="px-4 py-2 font-normal">Day</th>
                <th className="px-4 py-2 text-right font-normal">Views</th>
                <th className="px-4 py-2 text-right font-normal">Visitors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/5 text-cream">
              {[...daily].reverse().map((d) => (
                <tr key={d.day}>
                  <td className="px-4 py-2">{dayLabel(d.day, { weekday: "short", day: "numeric", month: "short" })}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{d.views}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{d.visitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

// Ranked list with a meter, the count and share always visible.
const Breakdown = ({ title, rows, total, color, render = (r) => r.label }) => (
  <Card title={title}>
    {rows.length ? (
      <ul className="space-y-3">
        {rows.map((r) => {
          const share = total ? r.n / total : 0;
          return (
            <li key={r.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-cream">{render(r)}</span>
                <span className="shrink-0 tabular-nums text-cream-dim">
                  {fmt.format(r.n)} <span className="text-cream-mute">· {Math.round(share * 100)}%</span>
                </span>
              </div>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-cream/5">
                <span className="block h-full rounded-full" style={{ width: `${Math.max(share * 100, 2)}%`, background: color }} />
              </span>
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="text-sm text-cream-mute">No data yet.</p>
    )}
  </Card>
);

const place = (v) => {
  const parts = [v.city, v.region].filter(Boolean);
  const country = countryName(v.country);
  return parts.length ? `${parts.join(", ")}, ${country}` : country;
};

const VisitorsAdmin = () => {
  const { theme } = useTheme();
  const color = BAR[theme] || BAR.dark;
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      setData(await api("visits", { query: { days } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Card title="Couldn't load visitor stats" description={error}>
        <Button onClick={load}>Retry</Button>
      </Card>
    );
  }
  if (!data) return <p className="text-cream-dim">Loading…</p>;

  const { totals, daily, countries, referrers, devices, browsers, recent } = data;
  const rangeLabel = `Last ${days} days`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-cream/10 bg-ink-800/70 p-1" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                days === r ? "bg-cream text-ink" : "text-cream-dim hover:text-cream"
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={load} disabled={busy}>
          <FiRefreshCw className={busy ? "animate-spin" : ""} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Total views" value={totals.views} hint="All time" />
        <Stat label="Unique visitors" value={totals.visitors} hint="All time" />
        <Stat label="Views" value={totals.range_views} hint={rangeLabel} />
        <Stat label="Visitors" value={totals.range_visitors} hint={rangeLabel} />
        <Stat label="Today" value={totals.today} hint="Views since midnight IST" />
      </div>

      <Card title="Views per day" description={`${rangeLabel} · one view = one visit session`}>
        <DailyChart daily={daily} color={color} />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Breakdown
          title="Countries"
          rows={countries}
          total={totals.range_views}
          color={color}
          render={(r) => (
            <>
              <span aria-hidden="true">{flag(r.label)}</span> {countryName(r.label)}
            </>
          )}
        />
        <Breakdown title="Sources" rows={referrers} total={totals.range_views} color={color} />
        <Breakdown title="Devices" rows={devices} total={totals.range_views} color={color} />
        <Breakdown title="Browsers" rows={browsers} total={totals.range_views} color={color} />
      </div>

      <Card title="Recent visitors" description="Latest 100 visits. Visitors are anonymous — location comes from the hosting edge, never a stored IP.">
        <div className="overflow-x-auto rounded-2xl border border-cream/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-ink-800 font-mono text-[11px] uppercase tracking-[0.14em] text-cream-dim">
              <tr>
                <th className="px-4 py-3 font-normal">When</th>
                <th className="px-4 py-3 font-normal">Location</th>
                <th className="px-4 py-3 font-normal">Source</th>
                <th className="px-4 py-3 font-normal">Device</th>
                <th className="px-4 py-3 font-normal">Visitor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/5">
              {recent.map((v) => (
                <tr key={v.id} className="text-cream-dim">
                  <td className="whitespace-nowrap px-4 py-3" title={new Date(v.created_at).toLocaleString("en-IN")}>
                    {timeAgo(v.created_at)}
                  </td>
                  <td className="px-4 py-3 text-cream">
                    <span aria-hidden="true">{flag(v.country)}</span> {place(v)}
                  </td>
                  <td className="px-4 py-3">{v.referrer || "Direct"}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <DeviceIcon type={v.device} />
                      {[v.browser, v.os].filter(Boolean).join(" · ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-mono text-[11px] text-cream-mute">#{v.visitor_id.replace(/^h-/, "").slice(0, 6)}</span>{" "}
                    {v.visits > 1 ? (
                      <span className="ml-1 rounded-full border border-cream/15 px-2 py-0.5 text-[11px] text-cream">
                        Returning · {v.visits} visits
                      </span>
                    ) : (
                      <span className="ml-1 rounded-full bg-cream/10 px-2 py-0.5 text-[11px] text-cream">New</span>
                    )}
                  </td>
                </tr>
              ))}
              {!recent.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-cream-mute">
                    No visits yet — they'll appear here once the live site gets traffic.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default VisitorsAdmin;
