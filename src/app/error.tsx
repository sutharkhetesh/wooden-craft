"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="not-found">
      <h1>A small interruption.</h1>
      <p>Something went wrong loading this page. Please try again.</p>
      <button className="button button-dark" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
