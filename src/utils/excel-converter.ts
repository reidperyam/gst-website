// Helper function to convert codeName to slug
export function generateSlug(codeName: string): string {
  return codeName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface ARRResult {
  arr: string;
  arrNumeric: number;
  currency: string;
}

// Helper function to parse ARR with currency
export function parseARR(arrStr: string): ARRResult {
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
export function parseTechnologies(techStr: string): string[] {
  if (!techStr) return [];
  return String(techStr)
    .split(/[,;]/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
}
