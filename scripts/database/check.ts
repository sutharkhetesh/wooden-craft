import { loadEnvConfig } from "@next/env";
import "../../src/lib/server/database-node";
import { createDatabaseClient } from "../../src/lib/server/database";

loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Missing database URL");
  const database = createDatabaseClient(process.env.DATABASE_URL);
  try {
    await database.contactMessage.findFirst({
      select: { id: true, name: true },
    });
    await database.enquiry.findFirst({ select: { id: true, quantity: true } });
    await database.attachment.findFirst({
      select: { id: true, enquiryId: true },
    });
    console.log(
      "Prisma connection verified; all three structured tables are accessible.",
    );
  } finally {
    await database.$disconnect();
  }
}

main().catch((error: unknown) => {
  // Raw database/driver errors may contain credentials or customer data.
  const code =
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    /^P[0-9]{4}$/.test(error.code)
      ? ` (${error.code})`
      : "";
  console.error(
    `Database check failed${code}. Check DATABASE_URL and run npm run db:migrate.`,
  );
  process.exitCode = 1;
});
