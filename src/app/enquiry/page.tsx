import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { Suspense } from "react";
import { PageIntro } from "@/components/shared/page-intro";
import { EnquiryForm } from "@/components/forms/enquiry-form";
export const metadata: Metadata = pageMetadata({
  title: "Request a Custom Quote",
  description:
    "Share your vision, materials and dimensions to request a personalised quotation for custom wooden furniture or bespoke interiors.",
  path: "/enquiry",
});
export default function Enquiry() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Request a Custom Quote", path: "/enquiry" },
        ])}
      />
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
