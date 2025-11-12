import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type TableRow = Record<string, JsonValue>;

interface BackupFile {
  timestamp: string;
  supabaseUrl: string;
  tables: Record<string, TableRow[]>;
}

async function restoreTable(tableName: string, data: TableRow[]) {
  if (!data || data.length === 0) {
    console.log(`  Skipping ${tableName} (no data)`);
    return;
  }

  console.log(`Restoring table: ${tableName} (${data.length} rows)`);

  try {
    const { error } = await supabase
      .from(tableName)
      .upsert(data, { onConflict: "id" });

    if (error) {
      console.error(`  ✗ Error restoring ${tableName}:`, error);
    } else {
      console.log(`  ✓ Restored ${data.length} rows to ${tableName}`);
    }
  } catch (error) {
    console.error(`  ✗ Exception restoring ${tableName}:`, error);
  }
}

async function main() {
  const backupTimestamp = process.argv[2];

  if (!backupTimestamp) {
    console.error("Usage: npm run db:restore <timestamp>");
    console.error("\nAvailable backups:");
    const backupsDir = path.join(process.cwd(), "backups");
    if (fs.existsSync(backupsDir)) {
      const backups = fs.readdirSync(backupsDir);
      backups.forEach((b) => console.log(`  - ${b}`));
    } else {
      console.error("  No backups found");
    }
    process.exit(1);
  }

  const backupFile = path.join(
    process.cwd(),
    "backups",
    backupTimestamp,
    "supabase-backup.json",
  );

  if (!fs.existsSync(backupFile)) {
    console.error(`Backup file not found: ${backupFile}`);
    process.exit(1);
  }

  console.log(`Restoring from: ${backupFile}\n`);

  const backupData = JSON.parse(
    fs.readFileSync(backupFile, "utf-8"),
  ) as BackupFile;

  console.log(`Backup created: ${backupData.timestamp}`);
  console.log(`Tables to restore: ${Object.keys(backupData.tables).length}\n`);

  const confirmRestore = process.env.CONFIRM_RESTORE === "yes";

  if (!confirmRestore) {
    console.error("\n⚠️  WARNING: This will overwrite existing data!");
    console.error(
      "To proceed, run with: CONFIRM_RESTORE=yes npm run db:restore <timestamp>",
    );
    process.exit(1);
  }

  for (const [tableName, data] of Object.entries(backupData.tables)) {
    await restoreTable(tableName, data);
  }

  console.log(`\n✓ Restore complete!`);
}

main().catch(console.error);
