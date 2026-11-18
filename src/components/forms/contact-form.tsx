"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { defaults } from "@/lib/enquiry/schema";
import { business, enquiryWhatsappUrl } from "@/lib/config";
const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Enter a valid email."),
  mobile: z
    .string()
    .regex(/^\+?[\d\s()-]{10,18}$/, "Enter a valid mobile number."),
  city: z.string().trim().min(2, "Enter your city.").max(100),
  description: z
    .string()
    .trim()
    .min(20, "Please tell us a little more (20 characters minimum).")
    .max(5000),
  website: z.string().max(0),
  consent: z.boolean().refine((v) => v, "Please agree to be contacted."),
});
type Values = z.infer<typeof schema>;
export function ContactForm() {
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
          title: "Consultation enquiry",
          location: values.city,
        }),
      );
      const res = await fetch("/api/enquiries", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Unable to send your message.");
      setReference(result.id);
      if (business.whatsapp) {
        const link = enquiryWhatsappUrl(
          {
            ...defaults,
            ...values,
            title: "Consultation enquiry",
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
      <div className="form-panel" role="status">
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
    <form className="form-panel" onSubmit={handleSubmit(submit)} noValidate>
      <h2>Tell us what’s on your mind.</h2>
      <p className="form-subtitle">
        Have a question or want to discuss an idea? Start here.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-fields">
        {(["name", "email", "mobile", "city"] as const).map((name) => (
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
                name === "email" ? "email" : name === "mobile" ? "tel" : "text"
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
            />
            {errors[name] && (
              <span className="field-error">{errors[name].message}</span>
            )}
          </div>
        ))}
        <div className="field full">
          <label htmlFor="contact-description">How can we help? *</label>
          <textarea
            id="contact-description"
            {...register("description")}
            placeholder="A little about your project or question…"
            rows={5}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <span className="field-error">{errors.description.message}</span>
          )}
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Leave blank</label>
        <input id="contact-website" {...register("website")} tabIndex={-1} />
      </div>
      <label className="consent">
        <input type="checkbox" {...register("consent")} />
        <span>
          I agree to be contacted about my message and to have these details
          stored for the studio to review.
        </span>
      </label>
      {errors.consent && (
        <p className="field-error">{errors.consent.message}</p>
      )}
      <button
        style={{ marginTop: 22 }}
        className="button button-dark"
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
      <p className="upload-hint">
        After saving, WhatsApp opens with your message. Tap Send to send it to
        the studio at +{business.whatsapp}.
      </p>
    </form>
  );
}
