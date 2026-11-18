import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { projects } from "@/data/studio";
import { PageIntro } from "@/components/shared/page-intro";
import { Photo } from "@/components/shared/photo";
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return {
    title: project?.name || "Project not found",
    description: project?.description,
  };
}
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <>
      <PageIntro
        eyebrow={`${p.category.toUpperCase()} / ILLUSTRATIVE CONCEPT`}
        title={p.name}
        description={p.location}
      />
      <div className="wrap">
        <div className="project-gallery">
          {p.images.map((im, i) => (
            <Photo
              key={`${im}-${i}`}
              name={im}
              alt={`${p.name} — reference ${i + 1}`}
              priority={i === 0}
              sizes={i === 0 ? "100vw" : "(max-width: 600px) 50vw, 50vw"}
            />
          ))}
        </div>
        <div className="project-description">
          <div>
            <h2>
              A space to make <em>your own.</em>
            </h2>
            <p>{p.description}</p>
            <p>{p.customization}</p>
            <Link
              className="button button-dark"
              href={`/enquiry?title=${encodeURIComponent(`Inspired by ${p.name}`)}`}
            >
              Get something similar made <ArrowUpRight size={16} />
            </Link>
            <p className="demo-note">
              This is an illustrative concept using reference photography, not a
              completed client commission.
            </p>
          </div>
          <div className="project-facts">
            <div>
              <h4>MATERIAL PALETTE</h4>
              <p>{p.materials}</p>
            </div>
            <div>
              <h4>YOUR POSSIBILITIES</h4>
              <p>{p.customization}</p>
            </div>
            <div>
              <h4>DESIGN APPROACH</h4>
              <p>
                Developed around your dimensions, style, preferred materials and
                budget.
              </p>
            </div>
            <Link className="text-link" href="/work">
              <ArrowLeft size={14} /> Back to selected work
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
