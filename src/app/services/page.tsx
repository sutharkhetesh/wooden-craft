import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Photo, ProjectCTA } from "@/components/shared";
import { services } from "@/lib/data";
export const metadata: Metadata = {
  title: "Our Expertise",
  description:
    "Explore custom wooden furniture, kitchens, wardrobes, doors, panelling and bespoke interior solutions.",
};
export default function Services() {
  return (
    <>
      <PageIntro
        eyebrow="WHAT WE CREATE"
        title="Thoughtful woodwork. Endless possibilities."
        description="From the piece you’ve always imagined to a room that works beautifully, discover what we can create around you."
      />
      <div className="wrap">
        {services.map((s, i) => (
          <section className="service-detail" id={s.id} key={s.id}>
            <Photo name={s.image} alt={s.name} />
            <div>
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
            </div>
          </section>
        ))}
      </div>
      <ProjectCTA />
    </>
  );
}
