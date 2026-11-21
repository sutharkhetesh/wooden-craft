import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { PageIntro } from "@/components/shared/page-intro";
import { ProjectCTA } from "@/components/shared/project-cta";
import { Portfolio } from "@/components/work/portfolio";
export const metadata: Metadata = pageMetadata({
  title: "Selected Work — Bespoke Woodwork Concepts",
  description:
    "Illustrative concepts for bespoke wooden furniture, kitchens, bedrooms and living spaces, showing what made-to-measure woodwork can become.",
  path: "/work",
});
export default function Work() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Selected Work", path: "/work" }])}
      />
      <PageIntro
        eyebrow="A FEW POSSIBILITIES"
        title="Beautifully personal. By design."
        description="Explore a collection of illustrative spaces and pieces. A starting point for a conversation about something entirely your own."
      />
      <Portfolio />
      <ProjectCTA />
    </>
  );
}
