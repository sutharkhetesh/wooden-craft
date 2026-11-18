import Link from "next/link";
export default function NotFound() {
  return (
    <section className="not-found">
      <p className="eyebrow">A LITTLE OFF THE GRAIN</p>
      <h1>Let’s find your way back.</h1>
      <p>The page you’re looking for isn’t here.</p>
      <Link className="button button-dark" href="/">
        Return home
      </Link>
    </section>
  );
}
