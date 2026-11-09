export type ValidationRuleId = "sf-digits" | "sf-id" | "alphanumeric" | "numeric" | "any";

export interface ValidationRule {
  id: ValidationRuleId;
  label: string;
  badge: string;
  description: string;
  validate: (token: string) => { isValid: boolean; reason?: string };
}

export const VALIDATION_RULES: Record<ValidationRuleId, ValidationRule> = {
  "sf-digits": {
    id: "sf-digits",
    label: "Salesforce / Blue Star (7-8 Digits)",
    badge: "7-8 Digits",
    description: "Standard 7 or 8-digit case numbers (e.g. 2713009, 27127281)",
    validate: (token: string) => {
      if (!token) return { isValid: false, reason: "Empty token" };
      if (/[^\d]/.test(token)) {
        return { isValid: false, reason: "Contains letters or non-digits" };
      }
      if (token.length < 7) {
        return { isValid: false, reason: `${token.length} digits (expected 7-8)` };
      }
      if (token.length > 8) {
        return { isValid: false, reason: `${token.length} digits (expected 7-8)` };
      }
      return { isValid: true };
    },
  },
  "sf-id": {
    id: "sf-id",
    label: "Salesforce 15 / 18-Char ID",
    badge: "15/18 Char ID",
    description: "Standard 15 or 18-character alphanumeric record ID (e.g. 500XXXXXXXXXXXX)",
    validate: (token: string) => {
      if (!token) return { isValid: false, reason: "Empty token" };
      if (!/^[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?$/.test(token)) {
        return { isValid: false, reason: "Must be 15 or 18 alphanumeric characters" };
      }
      return { isValid: true };
    },
  },
  "alphanumeric": {
    id: "alphanumeric",
    label: "Alphanumeric Code / CID",
    badge: "Alphanumeric",
    description: "Codes with uppercase letters, numbers, and hyphens (e.g. CID-104928, A26018)",
    validate: (token: string) => {
      if (!token) return { isValid: false, reason: "Empty token" };
      if (!/^[A-Za-z0-9_-]{3,30}$/.test(token)) {
        return { isValid: false, reason: "Invalid alphanumeric format" };
      }
      return { isValid: true };
    },
  },
  "numeric": {
    id: "numeric",
    label: "Any Numeric Digits",
    badge: "Numbers",
    description: "Any numeric digits regardless of length",
    validate: (token: string) => {
      if (!token) return { isValid: false, reason: "Empty token" };
      if (!/^\d+$/.test(token)) {
        return { isValid: false, reason: "Must contain numbers only" };
      }
      return { isValid: true };
    },
  },
  "any": {
    id: "any",
    label: "Any Token (No Filter)",
    badge: "Any",
    description: "Accepts any non-empty ticket or identifier",
    validate: (token: string) => {
      return { isValid: token.length > 0 };
    },
  },
};

export interface DuplicateItem {
  ticket: string;
  count: number;
}

export interface InvalidTokenItem {
  ticket: string;
  reason: string;
  index: number;
}

export interface AnalyzedTicketList {
  rawTokens: string[];
  totalRawCount: number;
  uniqueTickets: string[];
  uniqueCount: number;
  duplicateCount: number;
  duplicateItems: DuplicateItem[];
  validTickets: string[];
  invalidTokens: InvalidTokenItem[];
  hasInvalid: boolean;
  hasDuplicates: boolean;
}

export function cleanTicketToken(raw: string): string {
  // Strip single/double quotes, curly quotes, brackets, and zero-width spaces
  return raw
    .replace(/[\u200B-\u200D\uFEFF\u00A0\s]+/g, "")
    .replace(/^['"“‘\[\(]+|['"”’\]\)]+$/g, "")
    .trim();
}

export function analyzeTickets(
  input: string,
  ruleId: ValidationRuleId = "sf-digits",
  deduplicate: boolean = true
): AnalyzedTicketList {
  if (!input || !input.trim()) {
    return {
      rawTokens: [],
      totalRawCount: 0,
      uniqueTickets: [],
      uniqueCount: 0,
      duplicateCount: 0,
      duplicateItems: [],
      validTickets: [],
      invalidTokens: [],
      hasInvalid: false,
      hasDuplicates: false,
    };
  }

  const rawTokens = input
    .split(/[\n\r,\t;]+/)
    .map(cleanTicketToken)
    .filter((t) => t.length > 0);

  const rule = VALIDATION_RULES[ruleId] || VALIDATION_RULES["sf-digits"];

  // Compute frequencies for deduplication inspector
  const frequencyMap = new Map<string, number>();
  const firstSeenOrder: string[] = [];

  for (const token of rawTokens) {
    const count = frequencyMap.get(token) || 0;
    if (count === 0) {
      firstSeenOrder.push(token);
    }
    frequencyMap.set(token, count + 1);
  }

  const duplicateItems: DuplicateItem[] = [];
  let duplicateCount = 0;

  frequencyMap.forEach((count, ticket) => {
    if (count > 1) {
      duplicateItems.push({ ticket, count });
      duplicateCount += count - 1;
    }
  });

  // Sort duplicates by occurrence count descending
  duplicateItems.sort((a, b) => b.count - a.count);

  const baseList = deduplicate ? firstSeenOrder : rawTokens;

  const validTickets: string[] = [];
  const invalidTokens: InvalidTokenItem[] = [];

  baseList.forEach((token, index) => {
    const res = rule.validate(token);
    if (res.isValid) {
      validTickets.push(token);
    } else {
      invalidTokens.push({
        ticket: token,
        reason: res.reason || "Invalid format",
        index,
      });
    }
  });

  return {
    rawTokens,
    totalRawCount: rawTokens.length,
    uniqueTickets: firstSeenOrder,
    uniqueCount: firstSeenOrder.length,
    duplicateCount,
    duplicateItems,
    validTickets,
    invalidTokens,
    hasInvalid: invalidTokens.length > 0,
    hasDuplicates: duplicateCount > 0,
  };
}

export interface QuickExporterPreset {
  id: string;
  label: string;
  description: string;
  iconName: string;
  format: (tickets: string[]) => string;
}

export const QUICK_EXPORTERS: QuickExporterPreset[] = [
  {
    id: "soql-in",
    label: "SOQL IN (...)",
    description: "Salesforce query IN clause ('2713009', '2712728')",
    iconName: "Database",
    format: (tickets) => {
      if (tickets.length === 0) return "";
      if (tickets.length <= 5) {
        return `(${tickets.map((t) => `'${t}'`).join(", ")})`;
      }
      return `(\n  ${tickets.map((t) => `'${t}'`).join(",\n  ")}\n)`;
    },
  },
  {
    id: "excel-column",
    label: "Excel Column",
    description: "Vertical newline rows ready to paste directly into Excel columns",
    iconName: "Sheet",
    format: (tickets) => tickets.join("\r\n"),
  },
  {
    id: "comma",
    label: "Comma-Separated",
    description: "Inline comma delimited list: 2713009, 2712728",
    iconName: "List",
    format: (tickets) => tickets.join(", "),
  },
  {
    id: "quoted-csv",
    label: "Quoted List",
    description: "Double quoted comma list: \"2713009\", \"2712728\"",
    iconName: "Quote",
    format: (tickets) => tickets.map((t) => `"${t}"`).join(", "),
  },
  {
    id: "jira-slack",
    label: "Jira / Slack List",
    description: "Markdown bullet list: - 2713009\\n- 2712728",
    iconName: "CheckSquare",
    format: (tickets) => tickets.map((t) => `- ${t}`).join("\n"),
  },
  {
    id: "json-array",
    label: "JSON Array",
    description: "Formatted JSON array of string tickets",
    iconName: "Code",
    format: (tickets) => JSON.stringify(tickets, null, 2),
  },
];
