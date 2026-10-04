import React, { useState } from "react";
import { FiCornerUpLeft, FiMail, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { api } from "./api";
import { Button, Card } from "./ui";

export const formatDate = (iso) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

const MessagesAdmin = ({ messages, setMessages }) => {
  const [openId, setOpenId] = useState(null);

  const setRead = async (msg, isRead) => {
    setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, is_read: isRead } : m)));
    try {
      await api("messages", { method: "PATCH", query: { id: msg.id }, body: { is_read: isRead } });
    } catch (err) {
      setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, is_read: !isRead } : m)));
      toast.error(err.message);
    }
  };

  const open = (msg) => {
    setOpenId(openId === msg.id ? null : msg.id);
    if (!msg.is_read) setRead(msg, true);
  };

  const remove = async (msg) => {
    if (!window.confirm(`Delete the message from ${msg.name}?`)) return;
    try {
      await api("messages", { method: "DELETE", query: { id: msg.id } });
      setMessages((list) => list.filter((m) => m.id !== msg.id));
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <Card title="Inbox" description={`${messages.length} messages · ${unread} unread. Submissions from the contact form land here.`}>
      <ul className="divide-y divide-cream/10 overflow-hidden rounded-2xl border border-cream/10">
        {messages.map((m) => (
          <li key={m.id} className={m.is_read ? "bg-ink/40" : "bg-ink-700/60"}>
            <button type="button" onClick={() => open(m)} className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-cream/5">
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.is_read ? "bg-transparent" : "bg-ember"}`} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className={`truncate ${m.is_read ? "text-cream-dim" : "font-semibold text-cream"}`}>{m.name}</span>
                  <span className="shrink-0 font-mono text-[11px] text-cream-mute">{formatDate(m.created_at)}</span>
                </span>
                <span className="block truncate text-sm text-cream-mute">{m.email}</span>
                {openId !== m.id && <span className="mt-1 block truncate text-sm text-cream-dim">{m.message}</span>}
              </span>
            </button>
            {openId === m.id && (
              <div className="px-9 pb-5">
                <p className="whitespace-pre-wrap rounded-2xl bg-ink p-4 leading-relaxed text-cream">{m.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ember-soft"
                  >
                    <FiCornerUpLeft /> Reply
                  </a>
                  <Button variant="ghost" onClick={() => setRead(m, !m.is_read)}>
                    <FiMail /> Mark {m.is_read ? "unread" : "read"}
                  </Button>
                  <Button variant="danger" onClick={() => remove(m)}>
                    <FiTrash2 /> Delete
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
        {!messages.length && <li className="px-4 py-14 text-center text-cream-mute">No messages yet.</li>}
      </ul>
    </Card>
  );
};

export default MessagesAdmin;
