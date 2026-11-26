const errorNames = new Set([
  "DatabaseConfigurationError",
  "PrismaClientKnownRequestError",
  "PrismaClientUnknownRequestError",
  "PrismaClientInitializationError",
  "PrismaClientValidationError",
  "PrismaClientRustPanicError",
]);

// Use fixed summaries instead of logging messages, SQL, or customer data.
export function storageErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") return { name: "Error" };
  const name =
    "name" in error &&
    typeof error.name === "string" &&
    errorNames.has(error.name)
      ? error.name
      : "Error";
  const code =
    "code" in error &&
    typeof error.code === "string" &&
    /^P[0-9]{4}$/.test(error.code) &&
    error.code.length === 5
      ? error.code
      : undefined;
  const invalidUrl =
    "message" in error &&
    typeof error.message === "string" &&
    error.message
      .trim()
      .split(/\n\s*\n/)
      .at(-1) === "Invalid URL";
  const summary =
    name === "DatabaseConfigurationError"
      ? "Invalid DATABASE_URL configuration"
      : name !== "Error" && invalidUrl
        ? "Invalid URL"
        : undefined;

  return { name, ...(code ? { code } : {}), ...(summary ? { summary } : {}) };
}
