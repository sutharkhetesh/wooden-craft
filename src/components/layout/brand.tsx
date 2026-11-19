import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Enteak home">
      <span className="brand-emblem" aria-hidden="true">
        <svg className="enteak-monogram" viewBox="0 0 64 64" fill="none">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 57V27a22 22 0 0 1 44 0v30Z" strokeWidth="2.3" />
            <path d="M17 57V29c0-11 6-17 15-17 11 0 16 8 16 18v27" strokeWidth="1.4" />
            <path d="M24 57c-4-10-3-22 2-29 6-9 14-5 15 3 1 8-7 12-3 26" strokeWidth="1.4" />
            <path d="M31 57c-5-9-4-18 0-22 4-4 6-1 4 4-3 6-2 11 0 18" strokeWidth="1.4" />
            <path d="M45 57c-3-10 1-14 3-18" strokeWidth="1.4" />
          </g>
        </svg>
      </span>
      <span className="brand-wordmark">
        Enteak
        <small>BESPOKE WOODWORK</small>
      </span>
    </Link>
  );
}
