"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { defaults } from "@/lib/enquiry/schema";
import { business, enquiryWhatsappUrl } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";
const makeSchema = (quick: boolean) =>
  z.object({
    name: z.string().trim().min(2, "Please enter your name.").max(100),
    email: quick
      ? z.union([z.literal(""), z.email("Enter a valid email.")])
      : z.email("Enter a valid email."),
    mobile: z
      .string()
      .regex(/^\+?[\d\s()-]{10,18}$/, "Enter a valid mobile number."),
    city: quick
      ? z.string().trim().max(100)
      : z.string().trim().min(2, "Enter your city.").max(100),
    description: z
      .string()
      .trim()
      .min(20, "Please tell us a little more (20 characters minimum).")
      .max(5000),
    website: z.string().max(0),
    consent: z.boolean().refine((v) => v, "Please agree to be contacted."),
  });
type Values = z.infer<ReturnType<typeof makeSchema>>;
export function ContactForm({ quick = false }: { quick?: boolean }) {
  const schema = makeSchema(quick);
  const formId = quick ? "quick" : "contact";
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      city: "",
      description: "",
      website: "",
      consent: false,
    },
  });
  async function submit(values: Values) {
    setError("");
    if (process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true") {
      setError(
        "This is a design preview. Run the included Next.js application to enable enquiries.",
      );
      return;
    }
    try {
      const data = new FormData();
      data.append(
        "data",
        JSON.stringify({
          ...defaults,
          ...values,
          source: "contact",
          title: quick ? "Quick enquiry" : "Consultation enquiry",
          location: values.city,
        }),
      );
      const res = await fetch("/api/enquiries", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Unable to send your message.");
      setReference(result.id);
      trackEvent("generate_lead", {
        form: quick ? "quick_enquiry" : "contact",
      });
      if (business.whatsapp) {
        const link = enquiryWhatsappUrl(
          {
            ...defaults,
            ...values,
            title: quick ? "Quick enquiry" : "Consultation enquiry",
            location: values.city,
          },
          result.id,
        );
        setWhatsappLink(link);
        window.location.assign(link);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Connection interrupted. Please try again.",
      );
    }
  }
  if (reference)
    return (
      <div
        className="form-panel contact-form contact-form-success"
        role="status"
      >
        <Check size={30} />
        <h2 style={{ marginTop: 20 }}>A conversation, started.</h2>
        <p className="form-subtitle">
          Your message has been saved. Your reference is:
        </p>
        <div className="reference-number">{reference}</div>
        <p className="upload-hint">
          Keep this number for your next conversation with the studio.
        </p>
        {whatsappLink && (
          <>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-dark"
            >
              Send on WhatsApp <ArrowUpRight size={16} />
            </a>
            <p className="upload-hint">
              Tap Send in WhatsApp to send your message to the studio.
            </p>
          </>
        )}
      </div>
    );
  return (
    <form
      className="form-panel contact-form"
      onSubmit={handleSubmit(submit)}
      aria-labelledby={`${formId}-form-title`}
      noValidate
    >
      <div className="contact-form-heading">
        <p className="eyebrow">
          {quick ? "QUICK ENQUIRY" : "CONTACT THE STUDIO"}
        </p>
        <h2 id={`${formId}-form-title`}>
          {quick
            ? "Let’s start with your idea."
            : "Tell us what’s on your mind."}
        </h2>
        <p className="form-subtitle">
          {quick
            ? "Just your name, number and a little about what you need. We can discuss the details together."
            : "Share your idea or ask a question. We’d love to hear from you."}
        </p>
      </div>
      <p className="contact-form-required">All fields are required.</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-fields">
        {(["name", "email", "mobile", "city"] as const)
          .filter((name) => !quick || name === "name" || name === "mobile")
          .map((name) => (
            <div className="field" key={name}>
              <label htmlFor={`contact-${name}`}>
                {
                  {
                    name: "Full name",
                    email: "Email address",
                    mobile: "Mobile number",
                    city: "Your city",
                  }[name]
                }{" "}
                *
              </label>
              <input
                id={`contact-${name}`}
                {...register(name)}
                type={
                  name === "email"
                    ? "email"
                    : name === "mobile"
                      ? "tel"
                      : "text"
                }
                autoComplete={
                  name === "name"
                    ? "name"
                    : name === "email"
                      ? "email"
                      : name === "mobile"
                        ? "tel"
                        : "address-level2"
                }
                aria-invalid={!!errors[name]}
                aria-describedby={
                  errors[name] ? `contact-${name}-error` : undefined
                }
                required
                placeholder={
                  {
                    name: "Your full name",
                    email: "you@example.com",
                    mobile: "e.g. +91 98765 43210",
                    city: "City or town",
                  }[name]
                }
              />
              {errors[name] && (
                <span className="field-error" id={`contact-${name}-error`}>
                  {errors[name].message}
                </span>
              )}
            </div>
          ))}
        <div className="field full">
          <label htmlFor="contact-description">How can we help? *</label>
          <textarea
            id="contact-description"
            {...register("description")}
            placeholder="Tell us about the piece you have in mind, your space, or how we can help."
            rows={5}
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description
                ? "contact-description-hint contact-description-error"
                : "contact-description-hint"
            }
            required
          />
          <span className="contact-field-hint" id="contact-description-hint">
            Please include at least 20 characters.
          </span>
          {errors.description && (
            <span className="field-error" id="contact-description-error">
              {errors.description.message}
            </span>
          )}
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Leave blank</label>
        <input id="contact-website" {...register("website")} tabIndex={-1} />
      </div>
      <label className="consent">
        <input
          type="checkbox"
          {...register("consent")}
          required
          aria-invalid={!!errors.consent}
          aria-describedby={
            errors.consent ? "contact-consent-error" : undefined
          }
        />
        <span>
          I agree to be contacted about my message and to have these details
          stored for the studio to review.
        </span>
      </label>
      {errors.consent && (
        <p className="field-error" id="contact-consent-error">
          {errors.consent.message}
        </p>
      )}
      <button
        className="button button-dark contact-form-submit"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle size={15} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send your message
            <ArrowUpRight size={16} />
          </>
        )}
      </button>
      {business.whatsapp && (
        <p className="contact-form-next">
          Your message is saved first, then WhatsApp opens. Tap Send in WhatsApp
          to share it with the studio.
        </p>
      )}
    </form>
  );
}
