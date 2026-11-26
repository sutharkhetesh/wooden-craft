// Keep structured diagnostics restricted to known types and codes. Redact
// private values before extracting a short message; never log raw metadata.
export function storageErrorDetails(
  error: unknown,
  privateValues: string[] = [],
) {
  if (!error || typeof error !== "object") return { name: "Error" };
  const knownNames = new Set([
    "DatabaseConfigurationError",
    "PrismaClientKnownRequestError",
    "PrismaClientUnknownRequestError",
    "PrismaClientInitializationError",
    "PrismaClientValidationError",
    "PrismaClientRustPanicError",
  ]);
  const name =
    "name" in error &&
    typeof error.name === "string" &&
    knownNames.has(error.name)
      ? error.name
      : "Error";
  const code =
    "code" in error &&
    typeof error.code === "string" &&
    /^P\d{4}$/.test(error.code)
      ? error.code
      : undefined;
  const driverCodes = new Set<string>();
  const driverKinds = new Set<string>();
  const signals = new Set<string>();
  const kinds = new Set([
    "AuthenticationFailed",
    "DatabaseAccessDenied",
    "DatabaseDoesNotExist",
    "TableDoesNotExist",
    "ColumnNotFound",
    "TooManyConnections",
    "UniqueConstraintViolation",
    "NullConstraintViolation",
    "ForeignKeyConstraintViolation",
    "TransactionWriteConflict",
    "LengthMismatch",
    "ValueOutOfRange",
    "InvalidInputValue",
    "postgres",
  ]);
  const networkCodes = new Set([
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "CERT_HAS_EXPIRED",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "ERR_TLS_CERT_ALTNAME_INVALID",
  ]);
  // Inspect only driver error wrappers, never arbitrary payload or SQL fields.
  const queue: unknown[] = [error];
  const seen = new Set<object>();
  for (let i = 0; i < queue.length && i < 32; i++) {
    const entry = queue[i];
    if (!entry || typeof entry !== "object" || seen.has(entry)) continue;
    seen.add(entry);
    const item = entry as Record<string, unknown>;
    for (const field of ["code", "originalCode", "errorCode"]) {
      const value = item[field];
      if (
        typeof value === "string" &&
        value !== code &&
        ((value.length === 5 && /^(P\d{4}|[0-9A-Z]{5})$/.test(value)) ||
          networkCodes.has(value))
      )
        driverCodes.add(value);
    }
    if (typeof item.kind === "string" && kinds.has(item.kind)) {
      driverKinds.add(item.kind);
    }
    // Emit fixed labels only; raw messages can contain credentials and form data.
    for (const field of ["message", "originalMessage"]) {
      const message = item[field];
      if (typeof message !== "string") continue;
      for (const [label, pattern] of [
        [
          "connection-timeout",
          /connection.*timed?\s*out|timeout exceeded.*connect/i,
        ],
        ["tls-error", /certificate|TLS handshake|SSL connection/i],
        [
          "authentication-failed",
          /password authentication failed|authentication failed/i,
        ],
        ["missing-table", /relation .+ does not exist/i],
        ["missing-column", /column .+ does not exist/i],
        [
          "connection-closed",
          /connection (?:terminated|closed)|socket hang up/i,
        ],
      ] as const)
        if (pattern.test(message)) signals.add(label);
    }
    for (const field of [
      "meta",
      "cause",
      "driverAdapterError",
      "error",
      "originalError",
    ]) {
      if (item[field] && typeof item[field] === "object")
        queue.push(item[field]);
    }
  }
  // Some adapter failures have neither a code nor a structured cause. Retain
  // the final error paragraph, omitting Prisma's invocation/argument preamble.
  let summary: string | undefined;
  if (
    name !== "Error" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    let message = error.message;
    const secrets = new Set(privateValues.filter(Boolean));
    for (const value of privateValues) {
      try {
        const url = new URL(value);
        if (url.password) secrets.add(decodeURIComponent(url.password));
        if (url.username) secrets.add(decodeURIComponent(url.username));
      } catch {
        /* Most private values are form fields, not URLs. */
      }
    }
    for (const value of [...secrets].sort((a, b) => b.length - a.length)) {
      for (const variant of [
        value,
        JSON.stringify(value).slice(1, -1),
        encodeURIComponent(value),
      ]) {
        message = message.split(variant).join("[redacted]");
      }
    }
    message = message.replace(
      /(?:postgres(?:ql)?|https?|wss?):\/\/[^\s<>"']+/gi,
      "[redacted-url]",
    );
    message = message.replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      "[redacted-email]",
    );
    summary = message
      .trim()
      .split(/\n\s*\n/)
      .at(-1)
      ?.slice(0, 1000);
  }
  return {
    name,
    ...(code ? { code } : {}),
    ...(driverCodes.size ? { driverCodes: [...driverCodes] } : {}),
    ...(driverKinds.size ? { driverKinds: [...driverKinds] } : {}),
    ...(signals.size ? { signals: [...signals] } : {}),
    ...(summary ? { summary } : {}),
  };
}
