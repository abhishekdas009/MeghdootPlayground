import Papa from "papaparse";

export const WARRANTY_EXPORT_HEADERS = [
  "Warranty_Term__r.WarrantyTermName",
  "Installation_date_operator__c",
  "Installation_From__c",
  "Installation_To__c",
  "Warranty_Term__r.WarrantyDuration",
  "Warranty_Term__r.WarrantyUnitOfTime",
  "Branch_Operator__c",
  "Branch__c",
  "Model_Operator__c",
  "Modals__c",
] as const;

export const REQUIRED_WARRANTY_HEADERS = [
  "Warranty_Term__r.WarrantyTermName",
  "Warranty_Term__r.WarrantyDuration",
  "Warranty_Term__r.WarrantyUnitOfTime",
] as const;

type WarrantyExportHeader = (typeof WARRANTY_EXPORT_HEADERS)[number];

export type BranchOperator = "IN" | "NOT IN";

export interface ParsedWarrantyCondition {
  sourceRow: number;
  termName: string;
  duration: number;
  unitOfTime: string;
  installationDateOperator: string | null;
  installationFrom: Date | null;
  installationTo: Date | null;
  branchOperator: BranchOperator | null;
  branches: string | null;
  modelOperator: string | null;
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

const EXTENDED_ISO_PATTERN = /^(\d{4})([-/])(\d{1,2})\2(\d{1,2})(?:[T\s].*)?$/;
const EXTENDED_FINDER_PATTERN = /^(\d{1,2})([-/])(\d{1,2})\2(\d{4})(?:[T\s].*)?$/;

export function parseImportDate(value: string): ParsedFinderDate | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(EXTENDED_ISO_PATTERN);
  if (isoMatch) {
    const year = Number.parseInt(isoMatch[1] ?? "", 10);
    const month = Number.parseInt(isoMatch[3] ?? "", 10);
    const day = Number.parseInt(isoMatch[4] ?? "", 10);
    const date = createUtcDate(year, month, day);
    if (date) return { date, isoDate: toIsoDate(date) };
  }

  const finderMatch = trimmed.match(EXTENDED_FINDER_PATTERN);
  if (finderMatch) {
    const day = Number.parseInt(finderMatch[1] ?? "", 10);
    const month = Number.parseInt(finderMatch[3] ?? "", 10);
    const year = Number.parseInt(finderMatch[4] ?? "", 10);
    const date = createUtcDate(year, month, day);
    if (date) return { date, isoDate: toIsoDate(date) };
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const date = createUtcDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate());
    if (date) return { date, isoDate: toIsoDate(date) };
  }

  return null;
}

export function parseFinderInstallationDate(value: string): ParsedFinderDate | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  // 1. Check DD-MM-YYYY or DD/MM/YYYY anywhere in string (typical Indian format)
  const dmyMatch = trimmed.match(/(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})/);
  if (dmyMatch && dmyMatch[1] && dmyMatch[2] && dmyMatch[3]) {
    const day = Number.parseInt(dmyMatch[1], 10);
    const month = Number.parseInt(dmyMatch[2], 10);
    const year = Number.parseInt(dmyMatch[3], 10);
    const date = createUtcDate(year, month, day);
    if (date) return { date, isoDate: toIsoDate(date) };
  }
  // 2. Check YYYY-MM-DD or YYYY/MM/DD anywhere in string
  const ymdMatch = trimmed.match(/(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
  if (ymdMatch && ymdMatch[1] && ymdMatch[2] && ymdMatch[3]) {
    const year = Number.parseInt(ymdMatch[1], 10);
    const month = Number.parseInt(ymdMatch[2], 10);
    const day = Number.parseInt(ymdMatch[3], 10);
    const date = createUtcDate(year, month, day);
    if (date) return { date, isoDate: toIsoDate(date) };
  }
  return null;
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

export function matchesWarrantyDate(
  installationDate: Date | string | null | undefined,
  installationDateOperator: string | null | undefined,
  installationFrom: Date | string | null | undefined,
  installationTo: Date | string | null | undefined,
): boolean {
  if (!installationDate) {
    return true;
  }

  const parseDay = (val: Date | string | null | undefined): number | null => {
    if (!val) return null;
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return null;
      // In IST / local or UTC, ensure calendar day UTC
      return Date.UTC(val.getUTCFullYear(), val.getUTCMonth(), val.getUTCDate());
    }
    const str = String(val).trim();
    // 1. Try DD-MM-YYYY anywhere in string
    const dmy = str.match(/(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})/);
    if (dmy && dmy[1] && dmy[2] && dmy[3]) {
      return Date.UTC(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
    }
    // 2. Try YYYY-MM-DD anywhere in string
    const iso = str.match(/(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
    if (iso && iso[1] && iso[2] && iso[3]) {
      return Date.UTC(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    }
    return null;
  };

  const userDay = parseDay(installationDate);
  if (!userDay) return true;

  const fromDay = parseDay(installationFrom);
  const toDay = parseDay(installationTo);

  const rawOp = (installationDateOperator || "").trim().toUpperCase();

  // If no date conditions in row, applies to any date
  if (!rawOp && !fromDay && !toDay) {
    return true;
  }

  // Greater Than / More Than
  if (rawOp === "GREATER THAN" || rawOp === "MORE THAN" || rawOp === ">" || rawOp === ">=") {
    if (fromDay !== null) {
      return userDay >= fromDay;
    }
    return true;
  }

  // Between
  if (rawOp === "BETWEEN") {
    if (fromDay !== null && userDay < fromDay) return false;
    if (toDay !== null && userDay > toDay) return false;
    return true;
  }

  // Less Than
  if (rawOp === "LESS THAN" || rawOp === "<" || rawOp === "<=") {
    if (toDay !== null && userDay > toDay) return false;
    if (fromDay !== null && userDay > fromDay) return false;
    return true;
  }

  // Standard range check if bounds exist without operator
  if (fromDay !== null && userDay < fromDay) return false;
  if (toDay !== null && userDay > toDay) return false;

  return true;
}

export function matchesWarrantyBranch(
  branch: string | null | undefined,
  branchOperator: string | null | undefined,
  branches: string | null | undefined,
): boolean {
  if (!branch || !branch.trim() || branch.trim().toLowerCase() === "optional branch...") {
    return true;
  }

  const rawUserBranch = branch.trim().toUpperCase().replace(/\s+/g, " ");
  const op = (branchOperator || "").trim().toUpperCase();

  // If no branch restriction, condition applies across all branches (all India)
  if (!op || !branches || !branches.trim()) {
    return true;
  }

  const branchList = branches
    .split(/[,;\r\n]+/)
    .map((b) => b.trim().toUpperCase().replace(/\s+/g, " "))
    .filter(Boolean);

  const containsBranch = branchList.some(
    (b) => b === rawUserBranch || rawUserBranch.includes(b) || b.includes(rawUserBranch),
  );

  if (op === "IN" || op === "EQUALS" || op === "=") {
    return containsBranch;
  }
  if (op === "NOT IN" || op === "NOT EQUALS" || op === "!=") {
    return !containsBranch;
  }

  return true;
}

export function matchesWarrantyModel(
  searchedModel: string,
  modelOperator: string | null | undefined,
  conditionModels: string | null | undefined,
): boolean {
  if (!conditionModels || !conditionModels.trim()) {
    return false;
  }

  const rawUser = searchedModel.trim().toUpperCase();
  const strippedUser = rawUser.replace(/^(?:BO|BI)[-_]?/, "");
  const normUser = rawUser.replace(/[\s\-_]/g, "");
  const normStrippedUser = strippedUser.replace(/[\s\-_]/g, "");

  const aliases = getWarrantyModelAliases(conditionModels);

  let containsModel = false;
  for (const alias of aliases) {
    const rawAlias = alias.trim().toUpperCase();
    const strippedAlias = rawAlias.replace(/^(?:BO|BI)[-_]?/, "");
    const normAlias = rawAlias.replace(/[\s\-_]/g, "");
    const normStrippedAlias = strippedAlias.replace(/[\s\-_]/g, "");

    if (
      rawUser === rawAlias ||
      strippedUser === strippedAlias ||
      normUser === normAlias ||
      normStrippedUser === normStrippedAlias ||
      normUser === normStrippedAlias ||
      normStrippedUser === normAlias
    ) {
      containsModel = true;
      break;
    }
  }

  const op = (modelOperator || "IN").trim().toUpperCase();
  if (op === "NOT IN" || op === "NOT EQUALS" || op === "!=") {
    return !containsModel;
  }

  // IN / Equals / default
  return containsModel;
}

function validateHeaders(headers: string[]): string | null {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  const missingHeaders = REQUIRED_WARRANTY_HEADERS.filter((header) => {
    const full = header.toLowerCase();
    const base = header.split(".").pop()!.toLowerCase();
    return !normalizedHeaders.includes(full) && !normalizedHeaders.includes(base);
  });

  if (missingHeaders.length === 0) return null;

  return `The file is missing the following required headers: ${missingHeaders.join(", ")}.`;
}

function findRowValue(row: Record<string, string>, ...candidateKeys: string[]): string {
  for (const candidate of candidateKeys) {
    if (row[candidate] !== undefined && row[candidate] !== null) {
      return cleanCell(row[candidate]);
    }
    const baseCandidate = candidate.split(".").pop()!;
    if (row[baseCandidate] !== undefined && row[baseCandidate] !== null) {
      return cleanCell(row[baseCandidate]);
    }
  }

  const rowEntries = Object.entries(row);
  for (const candidate of candidateKeys) {
    const lowerCandidate = candidate.toLowerCase();
    const lowerBase = candidate.split(".").pop()!.toLowerCase();
    for (const [key, rawVal] of rowEntries) {
      const trimmedLowerKey = key.trim().toLowerCase();
      if (trimmedLowerKey === lowerCandidate || trimmedLowerKey === lowerBase) {
        return cleanCell(rawVal);
      }
    }
  }

  return "";
}

function valueAt(row: Record<string, string>, header: string): string {
  return findRowValue(row, header);
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

    const termName = findRowValue(row, "Warranty_Term__r.WarrantyTermName", "WarrantyTermName", "TermName");
    const durationValue = findRowValue(row, "Warranty_Term__r.WarrantyDuration", "WarrantyDuration", "Duration");
    const unitOfTime = findRowValue(row, "Warranty_Term__r.WarrantyUnitOfTime", "WarrantyUnitOfTime", "UnitOfTime");
    const installationDateOperatorValue = findRowValue(row, "Installation_date_operator__c", "Installation_Date_Operator__c", "InstallationDateOperator__c", "InstallationDateOperator");
    const installationFromValue = findRowValue(row, "Installation_From__c", "InstallationFrom__c", "Installation_From", "InstallationFrom");
    const installationToValue = findRowValue(row, "Installation_To__c", "InstallationTo__c", "Installation_To", "InstallationTo");
    const branchOperatorValue = findRowValue(row, "Branch_Operator__c", "BranchOperator__c", "Branch_Operator", "BranchOperator");
    const branchesValue = findRowValue(row, "Branch__c", "Branch", "Branches");
    const modelOperatorValue = findRowValue(row, "Model_Operator__c", "ModelOperator__c", "Model_Operator", "ModelOperator");
    const modelsValue = findRowValue(row, "Modals__c", "Models__c", "Modals", "Models");
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
      installationDateOperator: installationDateOperatorValue || null,
      installationFrom: installationFrom?.date ?? null,
      installationTo: installationTo?.date ?? null,
      branchOperator: branchOperator === "INVALID" ? null : branchOperator,
      branches: branchesValue || null,
      modelOperator: modelOperatorValue || null,
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
