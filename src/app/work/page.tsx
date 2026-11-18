import type { Metadata } from "next";
import { PageIntro } from "@/components/shared/page-intro";
import { ProjectCTA } from "@/components/shared/project-cta";
import { Portfolio } from "@/components/work/portfolio";
export const metadata: Metadata = {
  title: "Selected Work",
  description:
    "Explore illustrative concepts for bespoke wooden furniture, kitchens, bedrooms and living spaces.",
};
export default function Work() {
  return (
    <>
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
