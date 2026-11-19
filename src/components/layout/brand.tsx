import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Anteak home">
      <span className="brand-emblem" aria-hidden="true">
        <span className="brand-mark">
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <span>
        ANTEAK
        <small>BESPOKE WOODWORK</small>
      </span>
    </Link>
  );
}
