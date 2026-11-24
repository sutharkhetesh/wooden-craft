import Link from "next/link";

const questions = [
  [
    "Can you make furniture to my measurements?",
    "Share your approximate dimensions, a sketch or a reference photo through the detailed enquiry form. The studio can discuss proportions, materials and finish with you before preparing a quote.",
  ],
  [
    "How much will my project cost?",
    "Pricing depends on the size, material, finish and scope of work. Send your requirements and budget for a personalised quotation. Collection prices and exact specifications are available from the studio.",
  ],
  [
    "Do you deliver and install in my area?",
    "The studio is based in Siyana, Rajasthan. Share your city or project location so the team can confirm delivery, installation availability and any related charges before you proceed.",
  ],
  [
    "How long will it take, and how do payments work?",
    "Share your preferred completion date. Ask the studio to confirm the production schedule, payment stages and what the quotation includes before approving the work.",
  ],
  [
    "Can I arrange a visit or a measurement appointment?",
    "Call or WhatsApp the studio to arrange a visit and discuss whether a measurement appointment is available for your location.",
  ],
  [
    "What about warranty and wood care?",
    "Ask for the care instructions and applicable warranty terms for your chosen material and finish. Confirm these details with the studio as part of your quotation.",
  ],
];

export function ProjectFAQ() {
  return (
    <section className="wrap project-faq" id="faqs" aria-labelledby="faq-title">
      <div>
        <p className="eyebrow">BEFORE WE BEGIN</p>
        <h2 id="faq-title">
          A little more <em>clarity.</em>
        </h2>
        <p>Answers to help you plan your next piece.</p>
        <Link href="/contact" className="text-link">
          Ask the studio a question ↗
        </Link>
      </div>
      <div className="faq-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
