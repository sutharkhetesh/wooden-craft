import {
  MotionSequence,
  MotionItem,
} from "@/components/motion/motion-sequence";
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro wrap">
      <MotionSequence>
        <MotionItem>
          <p className="eyebrow">{eyebrow}</p>
        </MotionItem>
        <MotionItem>
          <h1>{title}</h1>
        </MotionItem>
        <MotionItem>
          <p className="intro-description">{description}</p>
        </MotionItem>
      </MotionSequence>
    </section>
  );
}
