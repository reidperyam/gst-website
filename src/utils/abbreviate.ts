// Function to abbreviate ARR value
export function abbreviateARR(arrStr: string): string {
  if (!arrStr || arrStr === 'Not in source' || arrStr === 'N/A') {
    return arrStr;
  }

  // Remove currency symbols and commas, extract numeric value
  let numericStr = arrStr.replace(/[$€£¥A,]/g, '').trim();

  // Extract multiplier
  let multiplier = 1;
  let suffix = '';

  if (/B$/i.test(numericStr)) {
    multiplier = 1000000000;
    numericStr = numericStr.replace(/B$/i, '').trim();
    suffix = 'B';
  } else if (/M$/i.test(numericStr)) {
    multiplier = 1000000;
    numericStr = numericStr.replace(/M$/i, '').trim();
    suffix = 'M';
  } else if (/K$/i.test(numericStr)) {
    multiplier = 1000;
    numericStr = numericStr.replace(/K$/i, '').trim();
    suffix = 'K';
  }

  const numeric = parseFloat(numericStr) * multiplier;

  // Determine currency symbol
  let currencySymbol = '$';
  if (arrStr.includes('€')) currencySymbol = '€';
  else if (arrStr.includes('£')) currencySymbol = '£';
  else if (arrStr.includes('¥')) currencySymbol = '¥';
  else if (arrStr.includes('A$')) currencySymbol = 'A$';

  // Handle NaN
  if (isNaN(numeric)) {
    return `${currencySymbol}0`;
  }

  // Convert to millions and abbreviate
  if (numeric >= 1000000000) {
    const billions = numeric / 1000000000;
    return `${currencySymbol}${billions.toFixed(1)}B`;
  } else if (numeric >= 1000000) {
    const millions = numeric / 1000000;
    return `${currencySymbol}${millions.toFixed(0)}M`;
  } else if (numeric >= 1000) {
    const thousands = numeric / 1000;
    return `${currencySymbol}${thousands.toFixed(0)}K`;
  } else {
    return `${currencySymbol}${numeric.toFixed(0)}`;
  }
}
