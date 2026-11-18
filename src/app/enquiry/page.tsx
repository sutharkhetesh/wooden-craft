import type { Metadata } from "next";
import { Suspense } from "react";
import { PageIntro } from "@/components/shared";
import { EnquiryForm } from "@/components/enquiry-form";
export const metadata: Metadata = {
  title: "Start Your Custom Project",
  description:
    "Share your vision, choose your materials and request a personalised quotation for custom wooden furniture or bespoke interiors.",
};
export default function Enquiry() {
  return (
    <>
      <PageIntro
        eyebrow="SOMETHING BEAUTIFUL STARTS HERE"
        title="Your idea. Let’s give it form."
        description="A few thoughtful questions, a little inspiration, and the beginning of something made just for you. No commitment. Just possibilities."
      />
      <Suspense
        fallback={
          <div className="wrap" style={{ paddingBottom: 80 }}>
            Preparing your project form…
          </div>
        }
      >
        <EnquiryForm />
      </Suspense>
    </>
  );
}
