
import { ParsedData } from '../types';

export const parseTableData = (text: string): ParsedData => {
  const lines = text.split(/\r?\n/);
  const result: ParsedData = {
    metadata: { period: '' },
    headers: [],
    rows: {},
  };

  if (lines.length === 0) return result;

  let currentLineIndex = 0;

  // 1. Extract Metadata (Look for 조회기간)
  while (currentLineIndex < lines.length) {
    const line = lines[currentLineIndex].trim();
    if (line.includes('조회기간')) {
      result.metadata.period = line.split(':')[1]?.trim() || '';
      currentLineIndex++;
      break;
    }
    currentLineIndex++;
  }

  // 2. Find and Parse Header Line (Handles cases where headers have newlines)
  let headerLine = '';
  while (currentLineIndex < lines.length) {
    const line = lines[currentLineIndex].trim();
    if (line.startsWith('구분')) {
      headerLine = line;
      // Check if next lines are continuations of the header (don't contain enough tabs or are wrapped in parens)
      let nextIdx = currentLineIndex + 1;
      while (nextIdx < lines.length) {
        const nextLine = lines[nextIdx].trim();
        // If the next line doesn't have many tabs and isn't a data row (data rows usually have numbers),
        // it might be a multi-line header part.
        if (nextLine && !nextLine.includes('\t') && (nextLine.startsWith('(') || nextLine.length < 20)) {
          headerLine += ' ' + nextLine;
          nextIdx++;
        } else {
          break;
        }
      }
      result.headers = headerLine.split('\t').slice(1).map(h => h.trim());
      currentLineIndex = nextIdx;
      break;
    }
    currentLineIndex++;
  }

  // 3. Parse Data Rows
  for (let i = currentLineIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('---')) continue;

    const parts = line.split('\t');
    if (parts.length < 2) continue; // Skip lines that aren't table rows

    const rowName = parts[0].trim();
    const values = parts.slice(1).map(val => {
      // Clean up number formatting (remove commas, handle empty)
      const cleaned = val.replace(/,/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    });

    if (rowName && rowName !== '구분') {
      result.rows[rowName] = values;
    }
  }

  return result;
};

export const formatNumber = (num: number): string => {
  if (isNaN(num) || num === undefined) return '0';
  return num.toLocaleString();
};

export const formatPercent = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return '0.0%';
  return (num * 100).toFixed(1) + '%';
};
