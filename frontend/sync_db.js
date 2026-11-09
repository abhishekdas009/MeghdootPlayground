const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Priority order for .env files: .env.local takes precedence over .env
const candidates = [
  path.join(__dirname, '.env.local'),
  path.join(process.cwd(), '.env.local'),
  path.join(__dirname, '..', '.env.local'),
  path.join(__dirname, '.env'),
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '..', '.env'),
];

let databaseUrl = process.env.DATABASE_URL;

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    if (envConfig.DATABASE_URL && !databaseUrl) {
      databaseUrl = envConfig.DATABASE_URL;
    }
    // If we found a remote URL (e.g. prisma/cloud), prioritize it over localhost
    if (envConfig.DATABASE_URL && !envConfig.DATABASE_URL.includes('localhost:')) {
      databaseUrl = envConfig.DATABASE_URL;
      break;
    }
  }
}

if (!databaseUrl) {
  console.error("❌ Error: DATABASE_URL could not be found in any .env or .env.local file.");
  process.exit(1);
}

// Strip surrounding quotes if present
databaseUrl = databaseUrl.replace(/^["']|["']$/g, '');

const isSsl = databaseUrl.includes('sslmode=require') || databaseUrl.includes('db.prisma.io');

const client = new Client({
  connectionString: databaseUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
});

async function run() {
  try {
    const maskedUrl = databaseUrl.replace(/:([^@]+)@/, ':****@');
    console.log(`Connecting to PostgreSQL database at: ${maskedUrl}...`);
    await client.connect();
    console.log("✅ Connected successfully!");

    console.log("\nInspecting current columns in Warranty_Conditions__c...");
    const preRes = await client.query(`
      SELECT column_name, ordinal_position 
      FROM information_schema.columns 
      WHERE table_name = 'Warranty_Conditions__c' 
      ORDER BY ordinal_position;
    `);
    console.log("Current columns:", preRes.rows.map(r => `${r.ordinal_position}. ${r.column_name}`).join(', ') || '(Table not found)');

    const countRes = await client.query(`
      SELECT COUNT(*) AS count FROM "Warranty_Conditions__c";
    `).catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`Current record count: ${countRes.rows[0].count}`);

    const sqlPath = path.join(__dirname, 'prisma', 'migrations', '20261102000000_add_warranty_operators', 'migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("\nApplying migration to reorder columns and add Installation_date_operator__c...");
    await client.query(sql);

    console.log("\nVerifying updated columns in Warranty_Conditions__c...");
    const postRes = await client.query(`
      SELECT column_name, ordinal_position, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Warranty_Conditions__c' 
      ORDER BY ordinal_position;
    `);

    console.log("\n✅ Columns successfully updated in order:");
    postRes.rows.forEach(r => {
      console.log(`  ${r.ordinal_position}. ${r.column_name} (${r.data_type})`);
    });

    const newCountRes = await client.query(`SELECT COUNT(*) AS count FROM "Warranty_Conditions__c";`);
    console.log(`\nPreserved record count: ${newCountRes.rows[0].count}`);

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error("\n❌ Could not connect to PostgreSQL on localhost:5432. Please ensure your PostgreSQL service is running.");
    } else {
      console.error("\n❌ Database error:", err);
    }
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

run();
