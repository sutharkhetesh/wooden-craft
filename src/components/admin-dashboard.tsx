"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Download,
  LogOut,
  ArrowUpRight,
  LoaderCircle,
  RefreshCw,
  X,
  LockKeyhole,
} from "lucide-react";
import { statuses } from "@/lib/data";
import type { EnquiryRecord } from "@/lib/schema";
export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [records, setRecords] = useState<EnquiryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [selected, setSelected] = useState<EnquiryRecord | null>(null);
  const [status, setStatus] = useState("New");
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/enquiries", { cache: "no-store" });
      if (res.status === 401) {
        setAuthenticated(false);
        setRecords([]);
        setSelected(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.enquiries);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load enquiries.");
    }
  }, []);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true") {
      setLoading(false);
      setError(
        "The admin dashboard requires the included Next.js server and a configured admin password. This hosted site is a design preview.",
      );
      return;
    }
    fetch("/api/admin/login", { cache: "no-store" })
      .then((r) => r.json())
      .then(async (data) => {
        setAuthenticated(data.authenticated);
        if (data.authenticated) await load();
        else if (!data.configured)
          setError(
            "Admin access is not configured. Set ADMIN_PASSWORD (12+ characters) and SESSION_SECRET (32+ characters) on the server.",
          );
      })
      .catch(() => setError("Unable to connect to the server."))
      .finally(() => setLoading(false));
  }, [load]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPassword("");
      setAuthenticated(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setError("");
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error("Unable to sign out. Please try again.");
      setAuthenticated(false);
      setRecords([]);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign out.");
    }
  }
  function select(record: EnquiryRecord) {
    setSelected(record);
    setStatus(record.status);
    setNotes(record.notes);
    setNotice("");
    setError("");
  }
  async function update() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/enquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setAuthenticated(false);
        setRecords([]);
        setSelected(null);
        throw new Error("Your session has expired. Please sign in again.");
      }
      if (!res.ok) throw new Error(data.error);
      setSelected({ ...selected, status, notes });
      setNotice("Enquiry updated.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save changes.");
    } finally {
      setBusy(false);
    }
  }
  async function exportCsv() {
    setError("");
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok)
        throw new Error("Unable to export. Check your session and try again.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `grain-form-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    }
  }
  if (loading)
    return (
      <div className="wrap admin-wrap">
        <LoaderCircle className="animate-spin" size={24} />
        <p>Opening the studio dashboard…</p>
      </div>
    );
  if (!authenticated)
    return (
      <div className="wrap">
        <form onSubmit={login} className="admin-login form-panel">
          <LockKeyhole
            size={24}
            style={{ color: "#a77d51", marginBottom: 20 }}
          />
          <p className="eyebrow">GRAIN & FORM / PRIVATE STUDIO</p>
          <h1>Welcome back.</h1>
          <p>Sign in to manage project enquiries.</p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="field">
            <label htmlFor="admin-password">Admin password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={300}
            />
          </div>
          <button
            className="button button-dark"
            type="submit"
            disabled={busy || process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true"}
          >
            {busy ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <>
                Open the studio
                <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    );
  const filtered = records.filter(
    (r) =>
      (filter === "All statuses" || r.status === filter) &&
      `${r.id} ${r.payload.name} ${r.payload.email} ${r.payload.mobile} ${r.payload.title} ${r.payload.city}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="wrap admin-wrap">
      <div className="admin-header">
        <div>
          <p className="eyebrow">THE STUDIO / ENQUIRY MANAGEMENT</p>
          <h1>Good things in the making.</h1>
        </div>
        <div>
          <button
            className="button button-outline"
            onClick={() => void load()}
            aria-label="Refresh enquiries"
          >
            <RefreshCw size={15} />
          </button>
          <button
            className="button button-outline"
            onClick={() => void exportCsv()}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button className="button button-dark" onClick={() => void logout()}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="admin-alert" role="status">
          {notice}
        </p>
      )}
      <div className="stats-grid">
        {[
          ["Total enquiries", records.length],
          ["New enquiries", records.filter((r) => r.status === "New").length],
          [
            "Pending enquiries",
            records.filter((r) =>
              ["Contacted", "Quotation Sent", "In Progress"].includes(r.status),
            ).length,
          ],
          ["Completed", records.filter((r) => r.status === "Completed").length],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="admin-controls">
        <input
          aria-label="Search enquiries"
          placeholder="Search name, reference, email, city or project…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filter by status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["All statuses", ...statuses].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                "Reference / Date",
                "Client",
                "Project",
                "Budget",
                "Status",
                "",
              ].map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} onClick={() => select(r)}>
                <td>
                  <strong style={{ fontWeight: 550 }}>{r.id}</strong>
                  <br />
                  <span style={{ color: "#7c776f", fontSize: 9 }}>
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </td>
                <td>
                  {r.payload.name}
                  <br />
                  <span style={{ color: "#7c776f", fontSize: 9 }}>
                    {r.payload.city}
                  </span>
                </td>
                <td>
                  {r.payload.title}
                  <br />
                  <span style={{ color: "#7c776f", fontSize: 9 }}>
                    {r.payload.projectType}
                  </span>
                </td>
                <td>{r.payload.budget}</td>
                <td>
                  <span className="status-badge">{r.status}</span>
                </td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      select(r);
                    }}
                    className="small-link"
                    aria-label={`Open enquiry ${r.id}`}
                  >
                    View <ArrowUpRight size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            {records.length
              ? "No enquiries match your search."
              : "Your next beautiful project starts here. New enquiries will appear when submitted."}
          </div>
        )}
      </div>
      {selected && (
        <section className="admin-detail">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <div>
              <p className="eyebrow">{selected.id}</p>
              <h2>{selected.payload.title}</h2>
            </div>
            <button
              className="menu-toggle"
              style={{ display: "block", alignSelf: "start" }}
              aria-label="Close enquiry"
              onClick={() => setSelected(null)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="admin-detail-grid">
            <div>
              {Object.entries(selected.payload)
                .filter(
                  ([key]) =>
                    !["attachments", "website", "consent"].includes(key),
                )
                .map(([key, value]) => (
                  <div className="summary-row" key={key}>
                    <span>
                      {(
                        {
                          projectType: "Project type",
                          title: "Title",
                          description: "Requirements",
                          dimensions: "Dimensions",
                          material: "Material",
                          quantity: "Quantity",
                          finish: "Finish",
                          budget: "Budget",
                          timeline: "Timeline",
                          location: "Location",
                          name: "Full name",
                          mobile: "Mobile",
                          whatsapp: "WhatsApp",
                          email: "Email",
                          city: "City",
                          instructions: "Instructions",
                        } as Record<string, string>
                      )[key] || key}
                    </span>
                    <span style={{ whiteSpace: "pre-wrap" }}>
                      {String(value || "Not provided")}
                    </span>
                  </div>
                ))}
              <p className="upload-hint">
                Consent to contact recorded with submission.
              </p>
              <div className="admin-images">
                {selected.payload.attachments.map((file) => (
                  <a
                    key={file.id}
                    href={`/api/admin/files/${file.id}?enquiry=${selected.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`/api/admin/files/${file.id}?enquiry=${selected.id}`}
                      alt={file.name}
                    />
                  </a>
                ))}
              </div>
              {!selected.payload.attachments.length && (
                <p className="upload-hint">No reference images attached.</p>
              )}
            </div>
            <div>
              <div className="field">
                <label htmlFor="enquiry-status">Enquiry status</label>
                <select
                  id="enquiry-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="internal-notes">
                  Internal notes · visible only to admins
                </label>
                <textarea
                  id="internal-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={10000}
                  rows={8}
                  placeholder="Consultation notes, quotation details, follow-up…"
                />
              </div>
              <button
                className="button button-dark"
                onClick={() => void update()}
                disabled={busy}
              >
                {busy ? (
                  <LoaderCircle className="animate-spin" size={15} />
                ) : (
                  <>
                    Save changes
                    <ArrowUpRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
