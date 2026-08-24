import Papa from "papaparse";

export const WARRANTY_EXPORT_HEADERS = [
  "Warranty_Term__r.WarrantyTermName",
  "Warranty_Term__r.WarrantyDuration",
  "Warranty_Term__r.WarrantyUnitOfTime",
  "Installation_From__c",
  "Installation_To__c",
  "Branch_Operator__c",
  "Branch__c",
  "Modals__c",
] as const;

type WarrantyExportHeader = (typeof WARRANTY_EXPORT_HEADERS)[number];

export type BranchOperator = "IN" | "NOT IN";

export interface ParsedWarrantyCondition {
  sourceRow: number;
  termName: string;
  duration: number;
  unitOfTime: string;
  installationFrom: Date | null;
  installationTo: Date | null;
  branchOperator: BranchOperator | null;
  branches: string | null;
  models: string | null;
  modelAliases: string[];
}

export interface WarrantyImportSummary {
  rows: number;
  modelAliases: number;
  unrestrictedModelRules: number;
  dateRestrictedRules: number;
  delimiter: "CSV" | "tab-separated";
}

export interface WarrantyImportParseResult {
  conditions: ParsedWarrantyCondition[];
  errors: string[];
  warnings: string[];
  summary: WarrantyImportSummary | null;
}

export interface ParsedFinderDate {
  date: Date;
  isoDate: string;
}

const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const ISO_DATE_PATTERN = /^(\d{4})([-/])(\d{2})\2(\d{2})$/;
const FINDER_DATE_PATTERN = /^(\d{2})([-/])(\d{2})\2(\d{4})$/;
const MODEL_WHITESPACE = /[\s\u00A0]+/g;

// Characters that Windows-1252 maps outside the ISO-8859-1 byte range.
// This lets us repair UTF-8 text that was previously decoded as Windows-1252
// (for example, `â€œ80-on-80â€` back to `“80-on-80”`).
const WINDOWS_1252_EXTENDED_BYTES = new Map<number, number>([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
  [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
  [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f],
]);

export function repairWarrantyText(value: string): string {
  // Avoid altering correctly encoded strings. `â`, `Ã`, and `Â` are the
  // tell-tale leading characters of this kind of corruption.
  if (!/[âÃÂ]/.test(value)) return value;

  const bytes: number[] = [];
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) return value;

    if (codePoint <= 0xff) {
      bytes.push(codePoint);
      continue;
    }

    const windows1252Byte = WINDOWS_1252_EXTENDED_BYTES.get(codePoint);
    if (windows1252Byte === undefined) return value;
    bytes.push(windows1252Byte);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
  } catch {
    return value;
  }
}

function cleanCell(value: unknown): string {
  return typeof value === "string" ? repairWarrantyText(value).trim() : "";
}

function createUtcDate(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateParts(
  value: string,
  pattern: RegExp,
  yearIndex: number,
  monthIndex: number,
  dayIndex: number,
): ParsedFinderDate | null {
  const match = value.match(pattern);
  if (!match) return null;

  const year = Number.parseInt(match[yearIndex] ?? "", 10);
  const month = Number.parseInt(match[monthIndex] ?? "", 10);
  const day = Number.parseInt(match[dayIndex] ?? "", 10);
  const date = createUtcDate(year, month, day);

  return date ? { date, isoDate: toIsoDate(date) } : null;
}

export function parseImportDate(value: string): ParsedFinderDate | null {
  return parseDateParts(value, ISO_DATE_PATTERN, 1, 3, 4);
}

export function parseFinderInstallationDate(value: string): ParsedFinderDate | null {
  const asIso = parseDateParts(value, ISO_DATE_PATTERN, 1, 3, 4);
  if (asIso) return asIso;
  return parseDateParts(value, FINDER_DATE_PATTERN, 4, 3, 1);
}

/**
 * Warranty exports use BO-/BI- as brand prefixes for the same product code.
 * Store and search the product code once so BO-IA718DCU, BI-IA718DCU, and
 * IA718DCU all resolve to IA718DCU.
 */
export function normalizeWarrantyModel(value: string): string {
  return value.trim().toUpperCase().replace(MODEL_WHITESPACE, "");
}

export function normalizeWarrantyBranch(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function parseBranchOperator(value: string): BranchOperator | null | "INVALID" {
  const normalized = value.trim().replace(/\s+/g, " ").toUpperCase();
  if (!normalized) return null;
  if (normalized === "IN" || normalized === "NOT IN") return normalized;
  return "INVALID";
}

export function parseWarrantyBranches(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];

  return [...new Set(
    value
      .split(",")
      .map(normalizeWarrantyBranch)
      .filter(Boolean),
  )];
}

interface ModelAliasParseResult {
  aliases: string[];
  ignoredEmptyValues: number;
  repairedLineBreaks: number;
}

/**
 * Models are comma-delimited. Some supplied Salesforce exports contain a line
 * break inside a quoted model cell. A break following `BO-`/`BI-` is a wrapped
 * model code; other breaks separate two model codes. Raw source is retained
 * unchanged in the database for auditability.
 */
function parseModelAliases(value: string): ModelAliasParseResult {
  const aliases = new Set<string>();
  let ignoredEmptyValues = 0;
  let repairedLineBreaks = 0;

  for (const commaPart of value.replace(/\r\n?/g, "\n").split(",")) {
    const lines = commaPart.split("\n");
    let pending = "";

    for (const line of lines) {
      const part = line.trim();
      if (!part) {
        if (!pending) ignoredEmptyValues += 1;
        continue;
      }

      if (!pending) {
        pending = part;
        continue;
      }

      if (pending.endsWith("-")) {
        pending += part;
        repairedLineBreaks += 1;
        continue;
      }

      const normalizedPending = normalizeWarrantyModel(pending);
      if (normalizedPending) aliases.add(normalizedPending);
      pending = part;
      repairedLineBreaks += 1;
    }

    if (pending) {
      const normalizedPending = normalizeWarrantyModel(pending);
      if (normalizedPending) aliases.add(normalizedPending);
    } else if (commaPart.trim()) {
      ignoredEmptyValues += 1;
    }
  }

  return {
    aliases: [...aliases],
    ignoredEmptyValues,
    repairedLineBreaks,
  };
}

export function getWarrantyModelAliases(value: string | null | undefined): string[] {
  return value?.trim() ? parseModelAliases(value).aliases : [];
}

export function isInstallationDateInRange(
  installationDate: Date,
  installationFrom: Date | null,
  installationTo: Date | null,
): boolean {
  // Warranty conditions are business dates, not timestamps. Manually entered
  // database records can contain a time component, which must not reject an
  // installation on the same calendar day.
  const toCalendarDay = (date: Date) => Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  const installationDay = toCalendarDay(installationDate);
  if (installationFrom && installationDay < toCalendarDay(installationFrom)) return false;
  if (installationTo && installationDay > toCalendarDay(installationTo)) return false;
  return true;
}

export function matchesWarrantyBranch(
  branch: string,
  branchOperator: string | null,
  branches: string | null,
): boolean {
  const operator = parseBranchOperator(branchOperator ?? "");
  if (operator === null) return true;
  if (operator === "INVALID" || !branch.trim()) return false;

  const branchValues = parseWarrantyBranches(branches);
  const containsBranch = branchValues.includes(normalizeWarrantyBranch(branch));
  return operator === "IN" ? containsBranch : !containsBranch;
}

function validateHeaders(headers: string[]): string | null {
  const missingHeaders = WARRANTY_EXPORT_HEADERS.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length === 0) return null;

  return `The file is missing the following required headers: ${missingHeaders.join(", ")}.`;
}

function valueAt(row: Record<string, string>, header: WarrantyExportHeader): string {
  return cleanCell(row[header]);
}

export function parseWarrantyImport(value: unknown): WarrantyImportParseResult {
  if (typeof value !== "string" || !value.trim()) {
    return {
      conditions: [],
      errors: ["Paste the standard warranty export or choose a CSV/TXT file."],
      warnings: [],
      summary: null,
    };
  }

  if (new TextEncoder().encode(value).byteLength > MAX_IMPORT_BYTES) {
    return {
      conditions: [],
      errors: ["The import is larger than 10 MB. Split it into a valid standard export before uploading."],
      warnings: [],
      summary: null,
    };
  }

  const source = value.replace(/^\uFEFF/, "");
  const parsed = Papa.parse<Record<string, string>>(source, {
    header: true,
    skipEmptyLines: "greedy",
    delimiter: "",
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim(),
  });
  const errors: string[] = [];
  const warnings: string[] = [];
  const delimiter = parsed.meta.delimiter;

  if (delimiter !== "," && delimiter !== "\t") {
    errors.push("Use a comma-delimited CSV file or the tab-delimited text copied from Salesforce.");
  }

  const headerError = validateHeaders(parsed.meta.fields ?? []);
  if (headerError) errors.push(headerError);

  for (const error of parsed.errors) {
    const rowNumber = typeof error.row === "number" ? error.row + 2 : null;
    errors.push(`${rowNumber ? `Row ${rowNumber}: ` : ""}${error.message}`);
  }

  if (errors.length > 0) {
    return { conditions: [], errors: [...new Set(errors)].slice(0, 12), warnings, summary: null };
  }

  const conditions: ParsedWarrantyCondition[] = [];
  let ignoredEmptyModelValues = 0;
  let repairedModelLineBreaks = 0;

  for (let index = 0; index < parsed.data.length; index += 1) {
    const row = parsed.data[index];
    const sourceRow = index + 2;
    if (!row) continue;

    const termName = valueAt(row, "Warranty_Term__r.WarrantyTermName");
    const durationValue = valueAt(row, "Warranty_Term__r.WarrantyDuration");
    const unitOfTime = valueAt(row, "Warranty_Term__r.WarrantyUnitOfTime");
    const installationFromValue = valueAt(row, "Installation_From__c");
    const installationToValue = valueAt(row, "Installation_To__c");
    const branchOperatorValue = valueAt(row, "Branch_Operator__c");
    const branchesValue = valueAt(row, "Branch__c");
    const modelsValue = valueAt(row, "Modals__c");
    if (!termName) {
      errors.push(`Row ${sourceRow}: WarrantyTermName is required.`);
    }
    if (!/^\d+$/.test(durationValue) || Number.parseInt(durationValue, 10) <= 0) {
      errors.push(`Row ${sourceRow}: WarrantyDuration must be a positive whole number.`);
    }
    if (!unitOfTime) {
      errors.push(`Row ${sourceRow}: WarrantyUnitOfTime is required.`);
    }

    const installationFrom = installationFromValue ? parseImportDate(installationFromValue) : null;
    const installationTo = installationToValue ? parseImportDate(installationToValue) : null;
    if (installationFromValue && !installationFrom) {
      errors.push(`Row ${sourceRow}: Installation_From__c must use yyyy-mm-dd or yyyy/mm/dd.`);
    }
    if (installationToValue && !installationTo) {
      errors.push(`Row ${sourceRow}: Installation_To__c must use yyyy-mm-dd or yyyy/mm/dd.`);
    }
    if (installationFrom && installationTo && installationFrom.date > installationTo.date) {
      errors.push(`Row ${sourceRow}: Installation_From__c cannot be after Installation_To__c.`);
    }

    const branchOperator = parseBranchOperator(branchOperatorValue);
    const branchValues = parseWarrantyBranches(branchesValue);
    if (branchOperator === "INVALID") {
      errors.push(`Row ${sourceRow}: Branch_Operator__c must be IN or NOT IN.`);
    }
    if (branchOperator && branchOperator !== "INVALID" && branchValues.length === 0) {
      errors.push(`Row ${sourceRow}: Branch__c is required when Branch_Operator__c is set.`);
    }
    if (!branchOperator && branchValues.length > 0) {
      errors.push(`Row ${sourceRow}: Branch_Operator__c is required when Branch__c is set.`);
    }

    const modelAliases = parseModelAliases(modelsValue);
    ignoredEmptyModelValues += modelAliases.ignoredEmptyValues;
    repairedModelLineBreaks += modelAliases.repairedLineBreaks;
    if (modelsValue && modelAliases.aliases.length === 0) {
      errors.push(`Row ${sourceRow}: Modals__c does not contain a usable model number.`);
    }

    if (errors.length > 0) continue;

    conditions.push({
      sourceRow,
      termName,
      duration: Number.parseInt(durationValue, 10),
      unitOfTime,
      installationFrom: installationFrom?.date ?? null,
      installationTo: installationTo?.date ?? null,
      branchOperator: branchOperator === "INVALID" ? null : branchOperator,
      branches: branchesValue || null,
      models: modelsValue || null,
      modelAliases: modelAliases.aliases,
    });
  }

  if (errors.length > 0) {
    return { conditions: [], errors: [...new Set(errors)].slice(0, 12), warnings, summary: null };
  }

  if (conditions.length === 0) {
    return {
      conditions: [],
      errors: ["No warranty rows were found in the standard export."],
      warnings,
      summary: null,
    };
  }

  if (ignoredEmptyModelValues > 0) {
    warnings.push(`${ignoredEmptyModelValues} empty model-list value(s) were ignored (for example, trailing commas).`);
  }
  if (repairedModelLineBreaks > 0) {
    warnings.push(`${repairedModelLineBreaks} embedded model-list line break(s) were normalized without changing the raw source data.`);
  }

  const modelAliases = conditions.reduce((total, condition) => total + condition.modelAliases.length, 0);
  return {
    conditions,
    errors: [],
    warnings,
    summary: {
      rows: conditions.length,
      modelAliases,
      unrestrictedModelRules: conditions.filter((condition) => condition.modelAliases.length === 0).length,
      dateRestrictedRules: conditions.filter(
        (condition) => condition.installationFrom !== null || condition.installationTo !== null,
      ).length,
      delimiter: delimiter === "," ? "CSV" : "tab-separated",
    },
  };
}
