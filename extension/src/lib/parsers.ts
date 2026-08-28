export const SALESFORCE_ID_REGEX = /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/;
export const CASE_ID_REGEX = /(?:^|[^\p{L}\p{N}])(500[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?)(?![\p{L}\p{N}])/gu;
export const SALESFORCE_TICKET_REGEX = /(?:^|[^A-Za-z0-9])([BISXCAD]\d{14,})(?![A-Za-z0-9])/gi;
export const CID_REGEX = /CID-?\d+/i;

// Spreadsheet and chat pastes can contain non-breaking or zero-width spaces.
// Treat them like ordinary whitespace when reading Asset Transfer identifiers.
const ASSET_TRANSFER_IDENTIFIER_WHITESPACE = /[\s\u180E\u200B-\u200D\u2060\uFEFF]+/g;
const ASSET_TRANSFER_IDENTIFIER_SEPARATOR = "[\\s\\u180E\\u200B-\\u200D\\u2060\\uFEFF]*";
const ASSET_TRANSFER_CID_REGEX = new RegExp(
  `C${ASSET_TRANSFER_IDENTIFIER_SEPARATOR}I${ASSET_TRANSFER_IDENTIFIER_SEPARATOR}D${ASSET_TRANSFER_IDENTIFIER_SEPARATOR}-?${ASSET_TRANSFER_IDENTIFIER_SEPARATOR}\\d(?:${ASSET_TRANSFER_IDENTIFIER_SEPARATOR}\\d)*`,
  'i'
);

export interface ComponentIdParseResult {
  totalCount: number;
  componentIds: string[];
  duplicateCount: number;
  ignoredCount: number;
}

export interface ParsedSOQLResult {
  headers: string[];
  rows: Array<Record<string, string>>;
}

export interface AssetTransferPair {
  componentId: string;
  newCid: string;
}

export const CHILD_DETAILS_COMPONENT_ID_HEADERS = [
  'component_id__c',
  'componentid__c',
  'component_id',
  'componentid',
] as const;

export const CHILD_DETAILS_PARENT_ACCOUNT_ID_HEADERS = [
  'parent.accountid',
  'parentaccountid',
  'parent_accountid',
  'parent.account.id',
] as const;

export const COMPONENT_INPUT_HEADERS = new Set([
  'component',
  'componentid',
  'component_id',
  'componentid__c',
  'component_id__c',
  'id',
]);

export function cleanHeader(value: string): string {
  return value.replace(/["\[\]]/g, '').trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
}

export function cleanValue(value: string): string {
  return value.replace(/["\[\]]/g, '').trim();
}

export function getRowValue(row: Record<string, string>, headers: readonly string[]): string {
  for (const header of headers) {
    const value = row[header];
    if (value) return value;
  }
  return '';
}

export function hasAnyHeader(headers: string[], candidates: readonly string[]): boolean {
  return candidates.some((candidate) => headers.includes(candidate));
}

export function getSalesforceRecordKey(value: string): string {
  return value.slice(0, 15);
}

export function quoteCSVCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCSVRow(values: string[]): string {
  return values.map(quoteCSVCell).join(',');
}

export function buildTSVRow(values: string[]): string {
  return values.map(quoteCSVCell).join('\t');
}

export function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i += 1;
      }
    } else if ((char === ',' || char === '\t') && !inQuotes) {
      values.push(current);
      current = '';
      i += 1;
    } else {
      current += char;
      i += 1;
    }
  }

  values.push(current);
  return values;
}

export function parseCaseIds(input: string): string[] {
  if (!input.trim()) return [];

  const seen = new Set<string>();
  const caseIds: string[] = [];

  const lines = input.split(/[\r\n]+/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if it's the specific format: ID|Category
    const pipeIndex = trimmed.indexOf("|");
    if (pipeIndex > 0) {
      const idPart = trimmed.slice(0, pipeIndex).trim();
      if (CASE_ID_REGEX.test(idPart)) {
        const recordKey = idPart.slice(0, 15);
        if (!seen.has(recordKey)) {
          seen.add(recordKey);
          caseIds.push(trimmed);
        }
        continue;
      }
    }
    
    // Fallback to normal parsing
    for (const match of trimmed.matchAll(CASE_ID_REGEX)) {
      const caseId = match[1];
      const recordKey = caseId?.slice(0, 15);
      if (!caseId || !recordKey || seen.has(recordKey)) continue;
      seen.add(recordKey);
      caseIds.push(caseId);
    }
  }

  return caseIds;
}

export function parseAssetTransferPairs(input: string): AssetTransferPair[] {
  if (!input.trim()) return [];
  const lines = input.split(/[\r\n]+/).filter((line) => line.trim());
  const pairs: AssetTransferPair[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (lower.includes('component') && (lower.includes('new cid') || lower.includes('cid'))) continue;

    const cidMatch = trimmed.match(ASSET_TRANSFER_CID_REGEX);
    if (!cidMatch || cidMatch.index === undefined) continue;

    const componentId = trimmed
      .slice(0, cidMatch.index)
      .replace(ASSET_TRANSFER_IDENTIFIER_WHITESPACE, '')
      .replace(/^[,;:]+|[,;:]+$/g, '');
    const newCid = cidMatch[0].replace(ASSET_TRANSFER_IDENTIFIER_WHITESPACE, '');

    if (componentId && /^CID-?\d+$/i.test(newCid)) {
      pairs.push({ componentId, newCid });
    }
  }

  return pairs;
}

export function parseSOQLResultWithHeaders(input: string): ParsedSOQLResult {
  if (!input.trim()) return { headers: [], rows: [] };

  const lines = input.split(/[\r\n]+/).filter((line) => line.trim());
  const rows: Array<Record<string, string>> = [];
  let headers: string[] = [];
  const detectedHeaders = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const values = parseCSVLine(trimmed);
    if (values.length === 0) continue;

    const firstVal = cleanValue(values[0] ?? '');

    if (
      firstVal === '_' ||
      firstVal === '' ||
      firstVal.toLowerCase() === 'component' ||
      firstVal.toLowerCase() === 'id'
    ) {
      headers = values.map(cleanHeader);
      headers.forEach((header) => {
        if (header) detectedHeaders.add(header);
      });
      continue;
    }

    if (headers.length === 0) continue;

    const row: Record<string, string> = {};
    for (let index = 0; index < values.length; index += 1) {
      const rawValue = values[index];
      const header = headers[index];
      if (!rawValue || !header) continue;
      row[header] = cleanValue(rawValue);
    }

    rows.push(row);
  }

  return { headers: [...detectedHeaders], rows };
}

export function parseSOQLResult(input: string): Array<Record<string, string>> {
  return parseSOQLResultWithHeaders(input).rows;
}

export function parseComponentIds(input: string): ComponentIdParseResult {
  if (!input.trim()) {
    return { totalCount: 0, componentIds: [], duplicateCount: 0, ignoredCount: 0 };
  }

  const seen = new Set<string>();
  const componentIds: string[] = [];
  let totalCount = 0;
  let duplicateCount = 0;
  let ignoredCount = 0;
  const values = input
    .replace(/^\uFEFF/, '')
    .split(/[\r\n,\t;]+/)
    .flatMap((part) => part.trim().split(/\s+/));

  for (const rawValue of values) {
    const componentId = cleanValue(rawValue).replace(/^'+|'+$/g, '').trim();
    const normalizedHeader = cleanHeader(componentId);

    if (!componentId || COMPONENT_INPUT_HEADERS.has(normalizedHeader)) continue;
    totalCount += 1;

    if (seen.has(componentId)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(componentId);

    if (SALESFORCE_ID_REGEX.test(componentId)) {
      ignoredCount += 1;
      continue;
    }

    componentIds.push(componentId);
  }

  return { totalCount, componentIds, duplicateCount, ignoredCount };
}

export function parseAssetResult(input: string): Record<string, Record<string, string>> {
  const rows = parseSOQLResult(input);
  const result: Record<string, Record<string, string>> = {};

  for (const row of rows) {
    const componentId = row.component_id__c || row.componentid__c || row.component_id;
    if (componentId) result[componentId] = row;
  }

  return result;
}

export function parseAccountResult(input: string): Record<string, string> {
  const rows = parseSOQLResult(input);
  const result: Record<string, string> = {};

  for (const row of rows) {
    const cid = row.customer_id__c || row.customerid__c || row.customer_id;
    const id = row.id;
    if (cid && id) result[cid] = id;
  }

  return result;
}

export interface ProductRecordProcessResult {
  output: string;
  skippedCount: number;
}

export function parseProductRecordResults(input: string): ProductRecordProcessResult {
  if (!input.trim()) return { output: "", skippedCount: 0 };
  
  const rows = parseSOQLResult(input);
  let skippedCount = 0;
  
  let output = `"Id"\t"RecordType.Id"\n`;
  let hasValid = false;
  
  for (const row of rows) {
    const recordTypeName = (row['recordtype.name'] || row['product2.recordtype.name'] || row['recordtype'] || '').trim().toLowerCase();
    const familyName = (row['product_family__r.name'] || row['product2.product_family__r.name'] || row['product_family__c'] || '').trim();
    const subFamilyName = (row['product_sub_family__r.name'] || row['product2.product_sub_family__r.name'] || row['product_sub_family__c'] || '').trim();
    const id = row['id'] || '';

    if (!id) continue;

    if (recordTypeName === 'product') {
      skippedCount++;
      continue;
    }

    if (!familyName || !subFamilyName) {
      skippedCount++;
      continue;
    }

    output += `"${id}"\t"012Ny0000003SwJIAU"\n`;
    hasValid = true;
  }
  
  return { output: hasValid ? output.trim() : "", skippedCount };
}
