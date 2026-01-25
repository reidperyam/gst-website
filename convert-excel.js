#!/usr/bin/env node

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const excelPath = path.join(__dirname, 'Development-assets', 'ProjectMetadata.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Helper function to convert codeName to slug
function generateSlug(codeName) {
  return codeName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to parse ARR with currency
function parseARR(arrStr) {
  if (!arrStr) return { arr: 'N/A', arrNumeric: 0, currency: 'USD' };

  const str = String(arrStr).trim();
  let currency = 'USD';

  // Determine currency
  if (str.includes('€')) currency = 'EUR';
  else if (str.includes('£')) currency = 'GBP';
  else if (str.includes('¥')) currency = 'JPY';
  else if (str.includes('A$')) currency = 'AUD';
  else currency = 'USD';

  // Extract numeric value - remove currency symbols and commas
  let numericStr = str.replace(/[$€£¥A]/g, '').replace(/,/g, '').trim();

  // Extract multiplier (B, M, K)
  let multiplier = 1;
  if (/B$/i.test(numericStr)) {
    multiplier = 1000000000;
    numericStr = numericStr.replace(/B$/i, '').trim();
  } else if (/M$/i.test(numericStr)) {
    multiplier = 1000000;
    numericStr = numericStr.replace(/M$/i, '').trim();
  } else if (/K$/i.test(numericStr)) {
    multiplier = 1000;
    numericStr = numericStr.replace(/K$/i, '').trim();
  }

  const numeric = parseFloat(numericStr) * multiplier;

  return {
    arr: str,
    arrNumeric: isNaN(numeric) ? 0 : Math.round(numeric),
    currency: currency
  };
}

// Helper function to parse technologies
function parseTechnologies(techStr) {
  if (!techStr) return [];
  return String(techStr)
    .split(/[,;]/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

// Map Excel columns to JSON structure
const projects = data.map((row, index) => {
  const codeName = row['Code name'] || `Project ${index + 1}`;
  const arr = parseARR(row['ARR (Inferred)']);

  return {
    id: generateSlug(codeName),
    codeName: codeName,
    industry: row['Industry'] || 'N/A',
    theme: row['Theme'] || 'Other',
    summary: row['Summary'] || '',
    arr: arr.arr,
    arrNumeric: arr.arrNumeric,
    currency: arr.currency,
    growthStage: row['Growth stage'] || 'N/A',
    year: parseInt(row['Year of the project']) || new Date().getFullYear(),
    technologies: parseTechnologies(row['Key technologies'])
  };
});

// Validate data
console.log(`✓ Converted ${projects.length} projects from Excel`);
if (projects.length !== 51) {
  console.warn(`⚠ Expected 51 projects, found ${projects.length}`);
}

// Check for missing required fields
const projectsWithIssues = projects.filter(p =>
  !p.codeName || !p.theme || !p.summary || p.year === 0
);
if (projectsWithIssues.length > 0) {
  console.warn(`⚠ Found ${projectsWithIssues.length} projects with missing required fields`);
  projectsWithIssues.forEach(p => {
    console.warn(`  - ${p.codeName || 'Unknown'}: missing ${!p.theme ? 'theme' : ''} ${!p.summary ? 'summary' : ''}`);
  });
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write JSON file
const outputPath = path.join(dataDir, 'projects.json');
fs.writeFileSync(outputPath, JSON.stringify(projects, null, 2));

console.log(`✓ Created ${outputPath}`);
console.log(`✓ Sample project: ${projects[0].codeName} (${projects[0].industry})`);
console.log(`✓ Total ARR: $${(projects.reduce((sum, p) => sum + p.arrNumeric, 0) / 1000000000).toFixed(1)}B`);
