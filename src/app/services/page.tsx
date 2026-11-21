import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/shared/page-intro";
import { Photo } from "@/components/shared/photo";
import { ProjectCTA } from "@/components/shared/project-cta";
import { services } from "@/data/studio";
import { Reveal } from "@/components/motion/reveal";
export const metadata: Metadata = pageMetadata({
  title: "Custom Wooden Furniture, Kitchens & Wardrobes",
  description:
    "Bespoke wooden furniture, kitchens, wardrobes, doors, wall panelling and office furniture, made to measure for your space. Request a custom quote.",
  path: "/services",
});
export default function Services() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Our Expertise", path: "/services" }]),
          ...services.map((s) => ({
            "@context": "https://schema.org",
            "@type": "Service",
            name: s.name,
            description: s.description,
            url: absoluteUrl(`/services#${s.id}`),
            areaServed: "IN",
            provider: { "@id": `${absoluteUrl("/")}#organization` },
          })),
        ]}
      />
      <PageIntro
        eyebrow="WHAT WE CREATE"
        title="Thoughtful woodwork. Endless possibilities."
        description="From the piece you’ve always imagined to a room that works beautifully, discover what we can create around you."
      />
      <div className="wrap">
        {services.map((s, i) => (
          <section className="service-detail" id={s.id} key={s.id}>
            <Photo name={s.image} alt={s.name} />
            <Reveal>
              <p className="eyebrow">0{i + 1} / OUR EXPERTISE</p>
              <h2>{s.name}</h2>
              <p>{s.description}</p>
              <h4>MAKE IT PERSONAL</h4>
              <p>{s.options}.</p>
              <h4>MATERIAL POSSIBILITIES</h4>
              <p>
                {s.materials}. Final selection follows a consultation about your
                requirements and budget.
              </p>
              <Link
                className="button button-dark"
                href={`/enquiry?type=${encodeURIComponent(s.type)}`}
              >
                Request a quote
                <ArrowUpRight size={17} />
              </Link>
            </Reveal>
          </section>
        ))}
      </div>
      <ProjectCTA />
    </>
  );
}
