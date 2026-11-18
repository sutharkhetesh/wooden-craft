"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/data";
import { Photo } from "./shared";
import { Reveal } from "./reveal";
export function Portfolio() {
  const [category, setCategory] = useState("All work");
  const categories = ["All work", ...new Set(projects.map((p) => p.category))];
  return (
    <div className="wrap portfolio-wrap">
      <div className="filters" aria-label="Filter projects">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`filter ${category === c ? "active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="portfolio-grid">
        {projects
          .filter((p) => category === "All work" || p.category === category)
          .map((p) => (
            <Reveal className="portfolio-card" key={p.slug}>
              <Link href={`/work/${p.slug}`}>
                <Photo name={p.image} alt={p.name} />
                <div className="project-title">
                  <div>
                    <p className="eyebrow">
                      {p.category}
                      <span className="demo-tag">CONCEPT</span>
                    </p>
                    <h3>{p.name}</h3>
                  </div>
                  <ArrowUpRight size={22} />
                </div>
              </Link>
            </Reveal>
          ))}
      </div>
      <p className="demo-note">
        All projects are illustrative design concepts using reference
        photography, not claims of completed client work.
      </p>
    </div>
  );
}
