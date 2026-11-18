import type { Metadata } from "next";
import { PageIntro, Photo, ProjectCTA } from "@/components/shared";
import { Reveal } from "@/components/reveal";
export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Discover the Grain & Form approach to thoughtful furniture design, honest materials and bespoke woodwork.",
};
export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="THE GRAIN & FORM PHILOSOPHY"
        title="Good things take shape, thoughtfully."
        description="We believe the most meaningful spaces are personal. And the most beautiful furniture feels like it belongs to you, from the very beginning."
      />
      <div className="wrap about-hero">
        <Photo
          name="interior"
          alt="A serene interior finished in warm natural materials"
          priority
          sizes="100vw"
        />
      </div>
      <section className="wrap about-content">
        <Reveal>
          <p className="eyebrow">DESIGN WITH INTENTION</p>
          <h2>
            Made for a room.
            <br />
            <em>And the life within it.</em>
          </h2>
          <p>
            A favourite chair. A table everyone gathers around. A wardrobe that
            makes the morning feel effortless. The furniture we live with
            becomes part of our daily story.
          </p>
          <p>
            Grain & Form is a demonstration of a more personal approach to
            woodwork: one that begins with listening, makes room for
            collaboration, and treats every detail as a design opportunity.
          </p>
          <p>
            Our philosophy is simple. Let the material be honest. Let the
            proportions feel right. And create something that stays useful, and
            beautiful, for years to come.
          </p>
          <p className="demo-note">
            Demonstration brand. This page describes the studio’s intended
            approach; it makes no claims about an existing workshop or company
            history.
          </p>
        </Reveal>
        <Photo name="detail" alt="The tactile beauty of a timber finish" />
      </section>
      <section className="principles">
        <div className="wrap principles-grid">
          {[
            [
              "Listen closely",
              "Great design starts with a real conversation about your home, your needs, and what matters to you.",
            ],
            [
              "Choose thoughtfully",
              "Discuss solid wood, veneers and engineered materials openly, with the right choice for the purpose, environment and budget.",
            ],
            [
              "Make with care",
              "Consider every joint, edge and surface. Plan the process carefully, from design approval through installation.",
            ],
          ].map(([title, body], i) => (
            <Reveal key={title}>
              <p className="eyebrow">0{i + 1} / OUR VALUES</p>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="wrap about-content">
        <Photo name="craft" alt="Tools and careful hands in a workshop" />
        <Reveal>
          <p className="eyebrow">THE MAKING MATTERS</p>
          <h2>
            Respect the wood.
            <br />
            <em>Refine the details.</em>
          </h2>
          <p>
            Every species has a different character. Oak brings open grain and
            quiet strength. Walnut adds depth and warmth. Teak offers a
            distinctive texture and natural resilience.
          </p>
          <p>
            The design conversation considers how a piece will be used, the
            conditions it will live in, its finish and its maintenance. Then
            comes the careful work of translating drawings into accurate
            proportions and well-resolved details.
          </p>
          <p>
            From material selection to finishing and installation, the goal is a
            piece you understand, feel connected to, and enjoy living with.
          </p>
        </Reveal>
      </section>
      <ProjectCTA />
    </>
  );
}
