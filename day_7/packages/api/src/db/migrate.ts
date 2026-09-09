import fs from 'fs';
import path from 'path';
import db from './client';

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

function ensureMigrationsTable(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      filename   TEXT    NOT NULL UNIQUE,
      applied_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

function getAppliedMigrations(): Set<string> {
  const rows = db.prepare('SELECT filename FROM _migrations').all() as { filename: string }[];
  return new Set(rows.map((r) => r.filename));
}

function applyMigration(filename: string, sql: string): void {
  // Run the migration SQL and record it in a single transaction
  db.transaction(() => {
    db.exec(sql);
    db.prepare('INSERT INTO _migrations (filename) VALUES (?)').run(filename);
  })();
  console.log(`  ✓ Applied: ${filename}`);
}

function runMigrations(): void {
  ensureMigrationsTable();

  const applied = getAppliedMigrations();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // numeric prefix ensures correct order

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  – Skipped (already applied): ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    applyMigration(file, sql);
    count++;
  }

  if (count === 0) {
    console.log('No new migrations to apply.');
  } else {
    console.log(`\nMigrations complete. ${count} file(s) applied.`);
  }
}

console.log('Running database migrations…');
runMigrations();
