export interface FuzzyMatchResult<T = string> {
  item: T;
  score: number; // Higher is better (0 to 100)
  highlightRanges: [number, number][]; // [start, end] indices in original string
  matchType: "exact" | "prefix" | "substring" | "fuzzy-tokens" | "acronym" | "typo";
}

export function cleanForFuzzy(str: string): string {
  return str.toLowerCase().replace(/[\s\-_/.]+/g, "");
}

/**
 * High-performance as-you-type fuzzy matcher designed for model numbers,
 * serial codes, and alphanumeric part numbers.
 */
export function fuzzyMatchString(query: string, candidate: string): FuzzyMatchResult<string> | null {
  if (!query || !query.trim()) {
    return {
      item: candidate,
      score: 10,
      highlightRanges: [],
      matchType: "exact",
    };
  }

  const q = query.trim().toLowerCase();
  const c = candidate.toLowerCase();

  // 1. Exact match
  if (c === q) {
    return {
      item: candidate,
      score: 100,
      highlightRanges: [[0, candidate.length]],
      matchType: "exact",
    };
  }

  // 2. Starts with query (Prefix match)
  if (c.startsWith(q)) {
    return {
      item: candidate,
      score: 95,
      highlightRanges: [[0, q.length]],
      matchType: "prefix",
    };
  }

  // 3. Substring match
  const subIdx = c.indexOf(q);
  if (subIdx !== -1) {
    return {
      item: candidate,
      score: 85 - subIdx * 0.5,
      highlightRanges: [[subIdx, subIdx + q.length]],
      matchType: "substring",
    };
  }

  // 4. Normalized match (ignores hyphens, spaces, slashes, e.g. "185V Vectra" matches "185V-VECTRA")
  const normQ = cleanForFuzzy(q);
  const normC = cleanForFuzzy(c);

  if (normC.includes(normQ)) {
    // Find approximate span in original candidate
    return {
      item: candidate,
      score: 80,
      highlightRanges: [[0, Math.min(candidate.length, q.length + 3)]],
      matchType: "fuzzy-tokens",
    };
  }

  // 5. Token-based match (e.g. "Vectra 185" matches "185V Vectra 4502801")
  const qTokens = q.split(/[\s\-_/.]+/).filter(Boolean);
  if (qTokens.length > 1) {
    let allTokensFound = true;
    const ranges: [number, number][] = [];
    let tokenScore = 75;

    for (const token of qTokens) {
      const idx = c.indexOf(token);
      if (idx !== -1) {
        ranges.push([idx, idx + token.length]);
      } else {
        const normToken = cleanForFuzzy(token);
        if (normC.includes(normToken)) {
          tokenScore -= 5;
        } else {
          allTokensFound = false;
          break;
        }
      }
    }

    if (allTokensFound) {
      return {
        item: candidate,
        score: tokenScore,
        highlightRanges: ranges,
        matchType: "fuzzy-tokens",
      };
    }
  }

  // 6. Subsequence match (characters in sequence, e.g. "185vect" in "185V-VECTRA")
  let qIdx = 0;
  let matches = 0;
  const seqRanges: [number, number][] = [];

  for (let cIdx = 0; cIdx < c.length && qIdx < q.length; cIdx++) {
    if (c[cIdx] === q[qIdx]) {
      seqRanges.push([cIdx, cIdx + 1]);
      qIdx++;
      matches++;
    }
  }

  if (matches === q.length && q.length >= 3) {
    return {
      item: candidate,
      score: 60 + (matches / candidate.length) * 15,
      highlightRanges: seqRanges,
      matchType: "acronym",
    };
  }

  // 7. Small typo tolerance (Levenshtein distance <= 1 for short queries, <= 2 for longer)
  if (q.length >= 4 && Math.abs(c.length - q.length) <= 3) {
    const dist = levenshteinDistance(normQ, normC);
    const maxDist = q.length <= 5 ? 1 : 2;
    if (dist <= maxDist) {
      return {
        item: candidate,
        score: 50 - dist * 10,
        highlightRanges: [[0, Math.min(candidate.length, q.length)]],
        matchType: "typo",
      };
    }
  }

  return null;
}

export function searchFuzzyList(
  query: string,
  candidates: string[],
  limit: number = 20
): FuzzyMatchResult<string>[] {
  if (!query || !query.trim()) {
    return candidates.slice(0, limit).map((c) => ({
      item: c,
      score: 10,
      highlightRanges: [],
      matchType: "exact",
    }));
  }

  const results: FuzzyMatchResult<string>[] = [];

  for (const c of candidates) {
    const match = fuzzyMatchString(query, c);
    if (match) {
      results.push(match);
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  let prevRow: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  let currRow: number[] = Array.from({ length: n + 1 }, () => 0);

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const p = prevRow[j - 1] ?? 0;
      const pj = prevRow[j] ?? 0;
      const cj = currRow[j - 1] ?? 0;
      if (s1[i - 1] === s2[j - 1]) {
        currRow[j] = p;
      } else {
        currRow[j] = Math.min(pj + 1, cj + 1, p + 1);
      }
    }
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[n] ?? 0;
}

/**
 * Baseline popular model database used for quick suggestions on live calls
 */
export const BLUESTAR_POPULAR_MODELS = [
  "185V-VECTRA",
  "185V-VECTRA-4502801",
  "183V-VECTRA-4502802",
  "123V-VECTRA-4502803",
  "185V-VERTIS-4502804",
  "183V-VERTIS-4502805",
  "CNHW12GAFU",
  "CNHW18GAFU",
  "CNHW24GAFU",
  "183V-CZQ",
  "185V-CZQ",
  "123V-CZQ",
  "183V-DAZ",
  "185V-DAZ",
  "WAC-183V-LZH",
  "WAC-185V-LZH",
  "SAC-183V-EAZ",
  "SAC-185V-EAZ",
  "F1201-SPLIT",
  "F1210-CASSETTE",
  "F1220-DUCTABLE",
];
