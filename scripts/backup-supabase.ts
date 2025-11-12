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

const TABLES_TO_BACKUP = [
  "media_items",
  "media_collections",
  "media_collection_items",
  "media_visibility",
  "media_pricing",
  "media_upload_batches",
  "essays",
  "essay_sections",
  "essay_media",
  "products",
  "product_media",
  "customers",
  "orders",
  "order_items",
  "gallery_projects",
  "project_media",
  "site_settings",
  "printful_products",
  "printful_settings",
] as const;

type BackupTable = (typeof TABLES_TO_BACKUP)[number];

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type TableRow = Record<string, JsonValue>;

type BackupTables = Partial<Record<BackupTable, TableRow[]>>;

interface BackupFile {
  timestamp: string;
  supabaseUrl: string;
  tables: BackupTables;
}

async function backupTable(tableName: BackupTable): Promise<TableRow[] | null> {
  console.log(`Backing up table: ${tableName}`);

  try {
    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      console.error(`Error backing up ${tableName}:`, error);
      return null;
    }

    console.log(`  ✓ Backed up ${data?.length || 0} rows from ${tableName}`);
    return (data ?? []) as TableRow[];
  } catch (error) {
    console.error(`Exception backing up ${tableName}:`, error);
    return null;
  }
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups", timestamp);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`Creating backup in: ${backupDir}\n`);

  const backup: BackupFile = {
    timestamp,
    supabaseUrl,
    tables: {},
  };

  for (const tableName of TABLES_TO_BACKUP) {
    const data = await backupTable(tableName);
    if (data !== null) {
      backup.tables[tableName] = data;
    }
  }

  const backupFile = path.join(backupDir, "supabase-backup.json");
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

  console.log(`\n✓ Backup complete!`);
  console.log(`  Location: ${backupFile}`);
  console.log(`  Tables backed up: ${Object.keys(backup.tables).length}`);

  const totalRows = Object.values(backup.tables).reduce(
    (acc, rows) => acc + (rows?.length ?? 0),
    0,
  );
  console.log(`  Total rows: ${totalRows}`);

  const summaryFile = path.join(backupDir, "BACKUP_SUMMARY.txt");
  const summary = `
Supabase Backup Summary
======================
Created: ${new Date().toLocaleString()}
Supabase URL: ${supabaseUrl}

Tables Backed Up:
${Object.entries(backup.tables)
  .map(([table, data]) => `  - ${table}: ${data?.length ?? 0} rows`)
  .join("\n")}

Total Rows: ${totalRows}

To restore this backup, run:
  npm run db:restore ${timestamp}
`;

  fs.writeFileSync(summaryFile, summary);
  console.log(`\n✓ Summary saved to: ${summaryFile}`);
}

main().catch(console.error);
