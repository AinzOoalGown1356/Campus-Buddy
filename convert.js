const fs = require('fs');

// Load the JSON file
const data = JSON.parse(fs.readFileSync('universities.json', 'utf8'));

// Filter for US schools only
const usSchools = data.filter(uni => uni.country === 'United States');

console.log(`Found ${usSchools.length} US universities`);

// Generate SQL INSERT statements
const sqlInserts = usSchools.map(uni => {
  const name = uni.name.replace(/'/g, "''"); // Escape single quotes for SQL
  const domain = uni.domains[0]; // Use first domain
  return `  ('${name}', '${domain}')`;
});

// Create the full SQL
const sql = `INSERT INTO universities (name, email_domain) VALUES\n${sqlInserts.join(',\n')}\nON CONFLICT (email_domain) DO NOTHING;\n`;

// Save to file
fs.writeFileSync('insert_universities.sql', sql);
