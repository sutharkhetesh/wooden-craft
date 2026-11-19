import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Enteak home">
      <span className="brand-emblem" aria-hidden="true">
        <span className="brand-mark">
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <span>
        ENTEAK
        <small>BESPOKE WOODWORK</small>
      </span>
    </Link>
  );
}
