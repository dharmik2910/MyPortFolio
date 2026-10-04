import React, { useRef, useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { FiArrowUpRight, FiCheck, FiCopy, FiMapPin, FiPhone } from "react-icons/fi";
import SocialHandles from "./SocialHandles";
import SectionHeading from "./SectionHeading";
import useMagnetic from "../hooks/useMagnetic";
import { trackSpotlight } from "../lib/scroll";
import { useContent } from "../lib/ContentContext";

const Contact = () => {
  const { contact: ContactData } = useContent();
  const formRef = useRef();
  const sendRef = useMagnetic(0.4);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Initialize EmailJS with your public key
    // Make sure this public key matches your EmailJS account
    emailjs.init("6vhErn8f6a61Dx45T");
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ContactData.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      window.location.href = `mailto:${ContactData.email}`;
    }
  };

  // Saves the message to the admin inbox alongside the EmailJS notification.
  const saveToInbox = async (form) => {
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.user_name,
        email: data.user_email,
        message: data.message,
        company: data.company,
      }),
    });
    if (!res.ok) throw new Error(`Inbox request failed (${res.status})`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const form = formRef.current;

    const [mail, inbox] = await Promise.allSettled([
      emailjs.sendForm("service_nv36dt8", "template_fafdq8q", form, "6vhErn8f6a61Dx45T"),
      saveToInbox(form),
    ]);

    if (mail.status === "fulfilled" || inbox.status === "fulfilled") {
      toast.success("Message sent successfully!");
      form.reset();
    } else {
      const error = mail.reason || {};
      console.error("FAILED...", mail.reason, inbox.reason);
      toast.error(`Unable to send message: ${error.text || error.message || "Unknown error"}`);
    }
    setSending(false);
  };

  return (
    <section id="contact" className="relative px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading index="04" label="Contact" title="Let's work" accent="together" />

        <div className="grid gap-16 lg:grid-cols-12">
          {/* Details */}
          <div className="lg:col-span-5">
            <p data-reveal="fade" className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-cream-mute">
              Drop a line
            </p>
            <div data-reveal="up" className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${ContactData.email}`}
                className="u-link break-all font-display text-2xl font-bold text-cream hover:text-ember sm:text-3xl"
              >
                {ContactData.email}
              </a>
              <button
                onClick={copyEmail}
                aria-label="Copy email address"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream-dim transition-colors hover:border-ember hover:text-ember"
              >
                {copied ? <FiCheck className="text-ok" /> : <FiCopy />}
              </button>
            </div>

            <ul className="mt-10 space-y-4 text-lg text-cream-dim">
              <li data-reveal="up" style={{ "--d": "80ms" }} className="flex items-center gap-4">
                <FiPhone className="text-ember" />
                <a href={`tel:${ContactData.phone.replace(/\s+/g, "")}`} className="u-link hover:text-cream">
                  {ContactData.phone}
                </a>
              </li>
              <li data-reveal="up" style={{ "--d": "160ms" }} className="flex items-center gap-4">
                <FiMapPin className="text-ember" />
                {ContactData.address}
              </li>
            </ul>

            <div data-reveal="up" style={{ "--d": "240ms" }} className="mt-10">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-cream-mute">Elsewhere</p>
              <SocialHandles />
            </div>
          </div>

          {/* Form */}
          <form
            data-reveal="up"
            ref={formRef}
            onSubmit={handleSubmit}
            onPointerMove={trackSpotlight}
            className="spotlight flex flex-col gap-8 rounded-3xl border border-cream/10 bg-ink-800/60 p-6 sm:p-10 lg:col-span-7"
          >
            <input type="hidden" name="to_email" value={ContactData.email} />
            {/* Honeypot: hidden from people, bots fill it in and get silently dropped */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="relative z-10 grid gap-8 sm:grid-cols-2">
              <div className="field">
                <input required id="user_name" placeholder=" " type="text" name="user_name" autoComplete="name" />
                <label htmlFor="user_name">Your name</label>
                <span className="bar" />
              </div>
              <div className="field">
                <input required id="user_email" placeholder=" " type="email" name="user_email" autoComplete="email" />
                <label htmlFor="user_email">Your email</label>
                <span className="bar" />
              </div>
            </div>
            <div className="field relative z-10">
              <textarea required id="message" placeholder=" " name="message" rows={5} />
              <label htmlFor="message">Tell me about your project</label>
              <span className="bar" />
            </div>
            <div className="relative z-10 flex items-center justify-between gap-6 pt-2">
              <p className="hidden max-w-[16rem] text-sm text-cream-mute sm:block">
                I usually reply within a day. Let's make something great.
              </p>
              <button
                ref={sendRef}
                type="submit"
                disabled={sending}
                className="btn btn-primary ml-auto h-28 w-28 shrink-0 flex-col !gap-1 !p-0 text-base disabled:cursor-not-allowed disabled:opacity-60 sm:h-32 sm:w-32"
              >
                <FiArrowUpRight className={`text-2xl ${sending ? "animate-spin" : ""}`} />
                {sending ? "Sending" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
