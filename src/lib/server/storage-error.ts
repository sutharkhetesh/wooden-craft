// Log only known error types and codes. Prisma messages and metadata can contain
// connection strings, SQL parameters, and customer details.
export function storageErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") return { name: "Error" };
  const knownNames = new Set([
    "PrismaClientKnownRequestError",
    "PrismaClientUnknownRequestError",
    "PrismaClientInitializationError",
    "PrismaClientValidationError",
    "PrismaClientRustPanicError",
  ]);
  const name =
    "name" in error && typeof error.name === "string" && knownNames.has(error.name)
      ? error.name
      : "Error";
  const code =
    "code" in error && typeof error.code === "string" && /^P\d{4}$/.test(error.code)
      ? error.code
      : undefined;
  return { name, ...(code ? { code } : {}) };
}
