class DatabaseConfigurationError extends Error {
  name = "DatabaseConfigurationError";
}

export function databaseUrl(value: string): string {
  let connectionString = value.trim();
  // Dashboard environment fields take a value, unlike quoted .env assignments.
  if (
    (connectionString.startsWith('"') && connectionString.endsWith('"')) ||
    (connectionString.startsWith("'") && connectionString.endsWith("'"))
  )
    connectionString = connectionString.slice(1, -1).trim();

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new DatabaseConfigurationError(
      "DATABASE_URL is invalid. Set a PostgreSQL connection URL in the deployment environment, without the DATABASE_URL= prefix.",
    );
  }
  if (
    !["postgres:", "postgresql:"].includes(parsed.protocol) ||
    !parsed.hostname ||
    !parsed.username ||
    parsed.pathname.length < 2 ||
    /[\r\n]/.test(connectionString)
  ) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL must be a PostgreSQL connection URL with a host, user, and database name.",
    );
  }
  return connectionString;
}
