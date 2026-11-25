"use client";
import { useState, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { useSearchParams } from "next/navigation";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  DoorOpen,
  PanelsTopLeft,
  Table2,
  BriefcaseBusiness,
  LayoutGrid,
  Armchair,
  ChefHat,
  UploadCloud,
  X,
  Check,
  LoaderCircle,
  MessageCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  enquirySchema,
  defaults,
  type EnquiryInput,
} from "@/lib/enquiry/schema";
import { types } from "@/data/studio";
import { business, enquiryWhatsappUrl } from "@/lib/config";
const labels = [
  "Project type",
  "The details",
  "Budget & timeline",
  "Inspiration",
  "Your details",
  "Review & send",
];
const icons = [
  BedDouble,
  DoorOpen,
  Table2,
  ChefHat,
  DoorOpen,
  PanelsTopLeft,
  BriefcaseBusiness,
  LayoutGrid,
  Armchair,
];
const stepFields: FieldPath<EnquiryInput>[][] = [
  ["projectType"],
  ["title", "description", "dimensions", "material", "quantity", "finish"],
  ["budget", "timeline", "location"],
  [],
  ["name", "mobile", "whatsapp", "email", "city", "instructions", "consent"],
];
export function EnquiryForm() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const form = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      ...defaults,
      title: params.get("title")?.slice(0, 120) || "",
      projectType: types.includes(params.get("type") as (typeof types)[number])
        ? (params.get("type") as (typeof types)[number])
        : "Other Custom Work",
    },
    mode: "onTouched",
  });
  const {
    register,
    watch,
    trigger,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = form;
  const values = watch();
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);
  function moveTo(n: number) {
    setStep(n);
    setServerError("");
    if (window.innerWidth < 801)
      requestAnimationFrame(() =>
        panel.current?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        }),
      );
  }
  async function next() {
    if (step === 3 && fileError) return;
    const valid = await trigger(stepFields[step], { shouldFocus: true });
    if (valid) moveTo(step + 1);
  }
  function addFiles(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list);
    if (files.length + added.length > 5) {
      setFileError("Choose up to 5 reference images.");
      return;
    }
    if (
      added.some(
        (f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type),
      )
    ) {
      setFileError("Please choose JPG, PNG or WebP images.");
      return;
    }
    if (added.some((f) => !f.size || f.size > 4 * 1024 * 1024)) {
      setFileError("Each image must be smaller than 4 MB.");
      return;
    }
    setFileError("");
    setFiles((old) => [...old, ...added]);
  }
  async function submit(data: EnquiryInput) {
    setServerError("");
    if (process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true") {
      setServerError(
        "This hosted design preview does not accept enquiries. Run the included Next.js application with a server to enable secure submission.",
      );
      return;
    }
    try {
      const payload = new FormData();
      payload.append("data", JSON.stringify(data));
      files.forEach((f) => payload.append("images", f));
      const res = await fetch("/api/enquiries", {
        method: "POST",
        body: payload,
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Unable to submit your enquiry.");
      setReference(result.id);
      trackEvent("generate_lead", {
        form: "custom_quote",
        project_type: data.projectType,
      });
      if (business.whatsapp)
        window.location.assign(enquiryWhatsappUrl(data, result.id));
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Connection interrupted. Please try again.",
      );
    }
  }
  function field(
    name: FieldPath<EnquiryInput>,
    label: string,
    placeholder = "",
    full = false,
    type = "text",
  ) {
    return (
      <div className={`field ${full ? "full" : ""}`}>
        <label htmlFor={name}>{label}</label>
        {name === "description" || name === "instructions" ? (
          <textarea
            id={name}
            {...register(name)}
            placeholder={placeholder}
            rows={name === "description" ? 5 : 3}
            aria-invalid={!!errors[name]}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
          />
        ) : (
          <input
            id={name}
            type={type}
            {...register(name)}
            placeholder={placeholder}
            autoComplete={
              name === "name"
                ? "name"
                : name === "mobile"
                  ? "tel"
                  : name === "email"
                    ? "email"
                    : name === "city"
                      ? "address-level2"
                      : "off"
            }
            aria-invalid={!!errors[name]}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
          />
        )}{" "}
        {errors[name] && (
          <span id={`${name}-error`} className="field-error">
            {errors[name]?.message}
          </span>
        )}
      </div>
    );
  }
  if (reference)
    return (
      <section className="wrap success-panel" aria-live="polite">
        <div className="success-icon">
          <Check size={28} />
        </div>
        <p className="eyebrow">THE START OF SOMETHING BEAUTIFUL</p>
        <h1>
          Your idea is in <em>good hands.</em>
        </h1>
        <p>
          Your enquiry has been saved. Keep this reference for your next
          conversation with the studio.
        </p>
        <div className="reference-number">{reference}</div>
        <p>
          We’ll use the details you provided to discuss your project.
          <br />
          Your reference images have been saved securely with your enquiry.
        </p>
        <div className="success-actions">
          {business.whatsapp && (
            <a
              href={enquiryWhatsappUrl(values, reference)}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-dark"
            >
              <MessageCircle size={17} />
              Continue on WhatsApp
            </a>
          )}
          <Link href="/work" className="button button-outline">
            Explore more possibilities
            <ArrowUpRight size={16} />
          </Link>
        </div>
        {business.whatsapp && (
          <p className="upload-hint">
            Tap Send in WhatsApp to send your enquiry to the studio. Reference
            images are not attached; you can add them in WhatsApp.
          </p>
        )}
      </section>
    );
  return (
    <div className="wrap enquiry-layout">
      <aside className="form-sidebar">
        <p className="eyebrow enquiry-sidebar-title">YOUR CUSTOM PROJECT</p>
        <nav className="step-list" aria-label="Enquiry steps">
          {labels.map((label, i) => (
            <button
              type="button"
              key={label}
              onClick={() => i < step && moveTo(i)}
              disabled={i > step}
              className={`step-nav ${step === i ? "current" : ""} ${step > i ? "complete" : ""}`}
              aria-current={step === i ? "step" : undefined}
            >
              <span>
                {step > i ? (
                  <Check size={13} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <ShieldCheck size={20} />
          <p style={{ margin: "12px 0 0" }}>
            A conversation, not a commitment. Share as much as you know — we’ll
            help work out the rest.
          </p>
        </div>
      </aside>
      <div
        className="form-panel studio-form enquiry-form-panel"
        ref={panel}
        style={{ scrollMarginTop: 95 }}
      >
        <form
          onSubmit={(e) => {
            if (step !== 5) {
              e.preventDefault();
              void next();
            } else void handleSubmit(submit)(e);
          }}
          noValidate
        >
          <div className="enquiry-progress-heading" aria-live="polite">
            <span>
              STEP {String(step + 1).padStart(2, "0")} OF{" "}
              {String(labels.length).padStart(2, "0")}
            </span>
            <span>{labels[step]}</span>
          </div>
          <progress
            className="enquiry-progress"
            value={step + 1}
            max={labels.length}
            aria-label="Enquiry progress"
          />
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="website">Leave this empty</label>
            <input
              id="website"
              {...register("website")}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          {serverError && (
            <p className="form-error" role="alert">
              {serverError}
            </p>
          )}
          <motion.div
            key={step}
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <>
                <p className="eyebrow">01 / YOUR STARTING POINT</p>
                <h2>What do you have in mind?</h2>
                <p className="form-subtitle">
                  Choose the closest fit. We can explore the details together.
                </p>
                <div className="type-grid">
                  {types.map((t, i) => {
                    const Icon = icons[i];
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`type-option ${values.projectType === t ? "selected" : ""}`}
                        aria-pressed={values.projectType === t}
                        onClick={() =>
                          form.setValue("projectType", t, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <Icon size={29} />
                        {t}
                        {values.projectType === t && (
                          <span
                            className="type-option-check"
                            aria-hidden="true"
                          >
                            <Check size={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <p className="eyebrow">02 / LET’S PICTURE IT</p>
                <h2>Tell us a little more.</h2>
                <p className="form-subtitle">
                  Every detail helps. It’s fine if you haven’t figured
                  everything out yet.
                </p>
                <div className="form-fields">
                  {field(
                    "title",
                    "Project title *",
                    "e.g. An oak dining table for six",
                    true,
                  )}
                  {field(
                    "description",
                    "What would you like us to create? *",
                    "Tell us about your space, style and how you’ll use the piece.",
                    true,
                  )}
                  {field(
                    "dimensions",
                    "Approximate dimensions",
                    "e.g. 180 × 90 × 75 cm",
                  )}
                  <div className="field">
                    <label htmlFor="material">Preferred wood or material</label>
                    <select id="material" {...register("material")}>
                      {[
                        "Not sure — please advise",
                        "Solid oak",
                        "Walnut",
                        "Teak",
                        "Ash",
                        "Plywood & veneer",
                        "Engineered wood",
                        "Other — describe in requirements",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  {field("quantity", "Quantity *", "1", false, "number")}
                  {field(
                    "finish",
                    "Preferred finish or colour",
                    "e.g. Natural matte oak",
                  )}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p className="eyebrow">03 / THE PRACTICAL DETAILS</p>
                <h2>A plan that works for you.</h2>
                <p className="form-subtitle">
                  These are starting points, not commitments. A final quotation
                  follows a design discussion.
                </p>
                <div className="form-fields">
                  <div className="field full">
                    <label htmlFor="budget">Estimated budget (INR) *</label>
                    <select id="budget" {...register("budget")}>
                      {[
                        "Let’s discuss",
                        "Under ₹50,000",
                        "₹50,000–₹1 lakh",
                        "₹1–3 lakh",
                        "₹3–5 lakh",
                        "₹5–10 lakh",
                        "₹10 lakh+",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                    {errors.budget && (
                      <span className="field-error">
                        {errors.budget.message}
                      </span>
                    )}
                  </div>
                  <div className="field full">
                    <label htmlFor="timeline">
                      Expected completion timeline *
                    </label>
                    <select id="timeline" {...register("timeline")}>
                      {[
                        "Flexible",
                        "Within 1 month",
                        "1–3 months",
                        "3–6 months",
                        "6 months+",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  {field(
                    "location",
                    "Project location / city *",
                    "City, neighbourhood or project address",
                    true,
                  )}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <p className="eyebrow">04 / A PICTURE OF YOUR VISION</p>
                <h2>A little inspiration?</h2>
                <p className="form-subtitle">
                  Share references, sketches or photos of your space. This step
                  is optional.
                </p>
                <label className="upload-area">
                  <UploadCloud size={32} />
                  <strong>Choose your reference images</strong>
                  <span>JPG, PNG or WebP · Up to 5 images · 4 MB each</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Upload reference images"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                {fileError && (
                  <p className="field-error" role="alert">
                    {fileError}{" "}
                    <button
                      type="button"
                      className="small-link"
                      onClick={() => setFileError("")}
                    >
                      Dismiss
                    </button>
                  </p>
                )}
                <div className="upload-previews">
                  {files.map((f, i) => (
                    <div className="upload-preview" key={`${f.name}-${i}`}>
                      {previews[i] && (
                        <img src={previews[i]} alt={`Reference: ${f.name}`} />
                      )}
                      <button
                        type="button"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => {
                          setFiles((old) => old.filter((_, j) => j !== i));
                          setFileError("");
                        }}
                      >
                        <X size={13} />
                      </button>
                      <p>{f.name}</p>
                    </div>
                  ))}
                </div>
                <p className="upload-hint">
                  Upload only images you have permission to share. References
                  help communicate a direction; every design is developed for
                  your project.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <p className="eyebrow">05 / KEEPING IN TOUCH</p>
                <h2>Let’s make a connection.</h2>
                <p className="form-subtitle">
                  A few details so the studio can reach you about your project.
                </p>
                <div className="form-fields">
                  {field("name", "Full name *", "Your full name")}
                  {field(
                    "mobile",
                    "Mobile number *",
                    "e.g. +91 followed by your number",
                    false,
                    "tel",
                  )}
                  {field(
                    "whatsapp",
                    "WhatsApp number (optional)",
                    "If different from your mobile",
                    false,
                    "tel",
                  )}
                  {field(
                    "email",
                    "Email address *",
                    "you@example.com",
                    false,
                    "email",
                  )}
                  {field("city", "Your city *", "Where are you based?", true)}
                  {field(
                    "instructions",
                    "Anything else we should know?",
                    "Preferred contact times, site considerations or other details.",
                    true,
                  )}
                </div>
                <label className="consent">
                  <input type="checkbox" {...register("consent")} />
                  <span>
                    I agree to be contacted about this enquiry. My details and
                    reference images will be stored securely for the studio to
                    review.
                  </span>
                </label>
                {errors.consent && (
                  <p className="field-error">{errors.consent.message}</p>
                )}
              </>
            )}
            {step === 5 && (
              <>
                <p className="eyebrow">ONE LAST LOOK</p>
                <h2>Your idea, all together.</h2>
                <p className="form-subtitle">
                  Review your details before sending. You can go back to change
                  anything.
                </p>
                <div className="summary-box">
                  <h3>{values.title}</h3>
                  {[
                    ["Project type", values.projectType],
                    ["Requirements", values.description],
                    ["Dimensions", values.dimensions || "To discuss"],
                    ["Material", values.material],
                    ["Quantity", values.quantity],
                    ["Finish", values.finish || "To discuss"],
                    ["Budget", values.budget],
                    ["Timeline", values.timeline],
                    ["Location", values.location],
                    [
                      "References",
                      `${files.length} image${files.length === 1 ? "" : "s"}`,
                    ],
                    ["Name", values.name],
                    ["Mobile", values.mobile],
                    ["WhatsApp", values.whatsapp || "Not provided"],
                    ["Email", values.email],
                    ["City", values.city],
                    ["Instructions", values.instructions || "None"],
                  ].map(([k, v]) => (
                    <div className="summary-row" key={k}>
                      <span>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
                <p className="upload-hint">
                  Submitting is a request for a conversation and custom
                  quotation. It does not place an order or require payment.
                </p>
                <p className="upload-hint">
                  After saving, WhatsApp opens with your enquiry. Tap Send to
                  send it to the studio. Add reference images in WhatsApp
                  separately.
                </p>
                {process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true" && (
                  <p className="form-error">
                    Design preview: submission requires the included Next.js
                    server. No personal data is sent from this preview.
                  </p>
                )}
              </>
            )}
          </motion.div>
          <div className="enquiry-email-note">
            <span className="enquiry-email-note-icon" aria-hidden="true">
              <Mail size={20} />
            </span>
            <p>
              <strong>No pricing online.</strong>
              <span>
                Our catalogue and your personalised quotation are shared by
                email.
              </span>
            </p>
          </div>
          <div className="form-buttons">
            {step > 0 ? (
              <button
                className="button button-outline"
                type="button"
                onClick={() => moveTo(step - 1)}
                disabled={isSubmitting}
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : (
              <span className="form-step-count">SELECT A PROJECT TYPE</span>
            )}
            {step < 5 ? (
              <button
                className="button button-dark"
                key="continue"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  void next();
                }}
              >
                {step === 4 ? "Review enquiry" : "Continue"}
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                key="submit"
                className="button button-dark"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={16} />
                    Sending…
                  </>
                ) : (
                  <>
                    Submit enquiry
                    <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
