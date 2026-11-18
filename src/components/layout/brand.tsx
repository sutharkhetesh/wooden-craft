import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Grain and Form home">
      <span className="brand-emblem" aria-hidden="true">
        <span className="brand-mark">
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <span>
        GRAIN <span className="brand-amp">&</span> FORM
        <small>BESPOKE WOODWORK</small>
      </span>
    </Link>
  );
}
