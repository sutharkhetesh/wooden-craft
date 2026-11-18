import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
export function ProjectCTA() {
  return (
    <section className="project-cta">
      <Reveal className="wrap cta-inner">
        <div>
          <p className="eyebrow">LET’S MAKE IT PERSONAL</p>
          <h2>
            Have something
            <br />
            <em>unique in mind?</em>
          </h2>
          <p>Tell us what you imagine. We’ll help bring it to life in wood.</p>
        </div>
        <Button asChild variant="light">
          <Link href="/enquiry">
            Start your custom project
            <ArrowUpRight size={18} />
          </Link>
        </Button>
        <span className="cta-rings" aria-hidden="true" />
      </Reveal>
    </section>
  );
}
