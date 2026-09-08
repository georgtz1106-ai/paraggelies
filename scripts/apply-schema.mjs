import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Λείπει το env var DATABASE_URL.");
  process.exit(1);
}

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "supabase", "schema.sql");
const sql = readFileSync(schemaPath, "utf8");

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

await client.connect();
try {
  await client.query(sql);
  console.log("Το schema εφαρμόστηκε επιτυχώς.");
} finally {
  await client.end();
}
