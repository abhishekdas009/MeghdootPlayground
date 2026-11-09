export interface SOQLDiagnostic {
  severity: "error" | "warning";
  message: string;
  line: number;
  column: number;
  token?: string;
  suggestion?: string;
}

export interface SOQLValidationReport {
  isValid: boolean;
  errors: SOQLDiagnostic[];
  warnings: SOQLDiagnostic[];
  detectedObjects: string[];
  detectedFields: string[];
}

export function validateSOQL(query: string): SOQLValidationReport {
  const errors: SOQLDiagnostic[] = [];
  const warnings: SOQLDiagnostic[] = [];
  const detectedObjects: string[] = [];
  const detectedFields: string[] = [];

  if (!query || !query.trim()) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      detectedObjects: [],
      detectedFields: [],
    };
  }

  const clean = query.trim();

  // 1. Check for SELECT keyword
  if (!/^\s*SELECT\b/i.test(clean)) {
    errors.push({
      severity: "error",
      message: "Query must begin with 'SELECT' keyword",
      line: 1,
      column: 1,
      suggestion: "Add 'SELECT' at the start of your query",
    });
  }

  // 2. Check for FROM keyword
  if (!/\bFROM\s+([A-Za-z0-9_]+)\b/i.test(clean)) {
    errors.push({
      severity: "error",
      message: "Query must contain a 'FROM <Object>' clause",
      line: 1,
      column: 1,
      suggestion: "Add 'FROM <Object>' (e.g. FROM Case, FROM WorkOrder)",
    });
  } else {
    const fromMatch = clean.match(/\bFROM\s+([A-Za-z0-9_]+)\b/i);
    if (fromMatch && fromMatch[1]) {
      detectedObjects.push(fromMatch[1]);
    }
  }

  // 3. Check for balanced parentheses
  let openParenCount = 0;
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === "(") openParenCount++;
    if (clean[i] === ")") openParenCount--;
    if (openParenCount < 0) {
      errors.push({
        severity: "error",
        message: "Unexpected closing parenthesis ')' with no matching opening '('",
        line: 1,
        column: i + 1,
      });
      break;
    }
  }
  if (openParenCount > 0) {
    errors.push({
      severity: "error",
      message: `Unclosed parenthesis detected (missing ${openParenCount} closing ')')`,
      line: 1,
      column: clean.length,
      suggestion: "Close all opening parentheses ')'",
    });
  }

  // 4. Check for unclosed single quotes
  let inQuote = false;
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === "'") {
      // Check for escaped quote \'
      if (i > 0 && clean[i - 1] === "\\") continue;
      inQuote = !inQuote;
    }
  }
  if (inQuote) {
    errors.push({
      severity: "error",
      message: "Unclosed single quote (') detected in query string literal",
      line: 1,
      column: clean.length,
      suggestion: "Close the open string literal with a matching single quote",
    });
  }

  // 5. Inspect SELECT fields region for missing commas
  const selectMatch = clean.match(/SELECT\s+([\s\S]+?)\s+FROM\b/i);
  if (selectMatch && selectMatch[1]) {
    const fieldsBlock = selectMatch[1].trim();

    // Split lines
    const lines = fieldsBlock.split(/[\r\n]+/);
    for (let lIdx = 0; lIdx < lines.length; lIdx++) {
      const line = lines[lIdx]?.trim() ?? "";
      if (!line) continue;

      // Ignore subquery parentheses inside fields
      if (line.startsWith("(") || line.endsWith(")")) continue;

      // Check for two consecutive field tokens separated by whitespace without a comma
      // e.g. "Id CaseNumber" or "Status Subject"
      const tokens = line.split(/\s+/).filter(Boolean);
      for (let t = 0; t < tokens.length - 1; t++) {
        const curr = tokens[t] ?? "";
        const next = tokens[t + 1] ?? "";

        if (
          !curr.endsWith(",") &&
          !curr.startsWith("(") &&
          !next.startsWith(")") &&
          !/^(SELECT|FROM|WHERE|AND|OR|AS)$/i.test(curr) &&
          !/^(SELECT|FROM|WHERE|AND|OR|AS)$/i.test(next) &&
          /^[A-Za-z0-9_.]+$/.test(curr) &&
          /^[A-Za-z0-9_.]+$/.test(next)
        ) {
          errors.push({
            severity: "error",
            message: `Missing comma between field '${curr}' and '${next}'`,
            line: lIdx + 1,
            column: line.indexOf(curr) + curr.length,
            token: curr,
            suggestion: `Add comma: '${curr}, ${next}'`,
          });
        }
      }

      // Check if line ends without comma when there is a subsequent field line
      if (
        lIdx < lines.length - 1 &&
        !line.endsWith(",") &&
        !line.endsWith(")") &&
        /^[A-Za-z0-9_.]+$/.test(line)
      ) {
        const nextLine = lines[lIdx + 1]?.trim() ?? "";
        if (nextLine && !nextLine.startsWith("FROM") && !nextLine.startsWith(")") && /^[A-Za-z0-9_.]+/.test(nextLine)) {
          warnings.push({
            severity: "warning",
            message: `Missing comma at end of line after '${line}'`,
            line: lIdx + 1,
            column: line.length,
            token: line,
            suggestion: `Add comma: '${line},'`,
          });
        }
      }
    }

    // Collect detected fields
    const rawTokens = fieldsBlock
      .replace(/[\r\n,]+/g, " ")
      .split(/\s+/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0 && /^[A-Za-z0-9_.]+$/.test(f) && !/^(SELECT|FROM|WHERE|AS)$/i.test(f));

    for (const f of rawTokens) {
      if (!detectedFields.includes(f)) {
        detectedFields.push(f);
      }
    }
  }

  // 6. Check for duplicate WHERE keyword
  const whereMatches = clean.match(/\bWHERE\b/gi);
  if (whereMatches && whereMatches.length > 1) {
    // Only an issue if not inside subquery
    if (!clean.includes("(SELECT")) {
      errors.push({
        severity: "error",
        message: "Multiple 'WHERE' clauses detected. Use 'AND' or 'OR' to chain conditions.",
        line: 1,
        column: 1,
        suggestion: "Replace extra 'WHERE' keywords with 'AND' or 'OR'",
      });
    }
  }

  // 7. Check for dangling operators like "WHERE Status = " or "WHERE CreatedDate > "
  if (/\bWHERE\b[\s\S]*?(?:=|>|<|!=|LIKE|IN)\s*(?:$|\b(AND|OR|ORDER|LIMIT|GROUP)\b)/i.test(clean)) {
    warnings.push({
      severity: "warning",
      message: "Dangling comparison operator in WHERE condition without a right-hand value",
      line: 1,
      column: 1,
      suggestion: "Complete the comparison condition",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    detectedObjects,
    detectedFields,
  };
}

/**
 * Automatically fixes common SOQL syntax mistakes:
 * 1. Uppercases standard SOQL keywords (SELECT, FROM, WHERE, AND, OR, IN, ORDER BY, LIMIT)
 * 2. Inserts missing commas between SELECT fields
 * 3. Balances missing closing parentheses
 * 4. Removes trailing commas before FROM
 */
export function autoFixSOQL(query: string): { fixedQuery: string; changesApplied: string[] } {
  if (!query || !query.trim()) return { fixedQuery: query, changesApplied: [] };

  const changes: string[] = [];
  let fixed = query;

  // 1. Keyword uppercase normalization
  const keywords = [
    { regex: /\bselect\b/g, kw: "SELECT" },
    { regex: /\bfrom\b/g, kw: "FROM" },
    { regex: /\bwhere\b/g, kw: "WHERE" },
    { regex: /\band\b/g, kw: "AND" },
    { regex: /\bor\b/g, kw: "OR" },
    { regex: /\bnot\b/g, kw: "NOT" },
    { regex: /\bin\b/g, kw: "IN" },
    { regex: /\blike\b/g, kw: "LIKE" },
    { regex: /\border\s+by\b/gi, kw: "ORDER BY" },
    { regex: /\blimit\b/g, kw: "LIMIT" },
    { regex: /\bgroup\s+by\b/gi, kw: "GROUP BY" },
    { regex: /\bhaving\b/gi, kw: "HAVING" },
  ];

  for (const { regex, kw } of keywords) {
    if (regex.test(fixed)) {
      fixed = fixed.replace(regex, kw);
    }
  }

  // 2. Fix missing commas between fields in SELECT block
  const selectMatch = fixed.match(/(SELECT\s+)([\s\S]+?)(\s+FROM\b)/i);
  if (selectMatch && selectMatch[1] && selectMatch[2] && selectMatch[3]) {
    const prefix = selectMatch[1];
    let fieldsBlock = selectMatch[2];
    const suffix = selectMatch[3];

    // Remove trailing comma right before FROM (e.g. "Id, Name, FROM Case")
    if (fieldsBlock.trim().endsWith(",")) {
      fieldsBlock = fieldsBlock.replace(/,\s*$/, "");
      changes.push("Removed trailing comma before FROM");
    }

    // Insert missing commas between newline tokens
    const lines = fieldsBlock.split(/\r?\n/);
    const fixedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let l = lines[i] ?? "";
      const trimmed = l.trim();

      if (
        i < lines.length - 1 &&
        trimmed.length > 0 &&
        !trimmed.endsWith(",") &&
        !trimmed.startsWith("(") &&
        !trimmed.endsWith(")") &&
        /^[A-Za-z0-9_.]+$/.test(trimmed)
      ) {
        const nextTrimmed = lines[i + 1]?.trim() ?? "";
        if (nextTrimmed.length > 0 && /^[A-Za-z0-9_.]+/.test(nextTrimmed)) {
          l = l + ",";
          changes.push(`Added missing comma after '${trimmed}'`);
        }
      }

      fixedLines.push(l);
    }

    fixed = fixed.replace(selectMatch[0], `${prefix}${fixedLines.join("\n")}${suffix}`);
  }

  // 3. Balance unclosed parentheses
  let openParen = 0;
  for (const char of fixed) {
    if (char === "(") openParen++;
    if (char === ")") openParen--;
  }

  if (openParen > 0) {
    fixed = fixed + "\n" + ")".repeat(openParen);
    changes.push(`Appended ${openParen} missing closing parenthesis ')'`);
  }

  return { fixedQuery: fixed, changesApplied: changes };
}
