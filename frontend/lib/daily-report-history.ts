export interface CategorySnapshot {
  category: string;
  count: number;
}

export interface DailyReportSnapshot {
  id: string;
  reportDate: string; // YYYY-MM-DD
  formattedDate: string; // e.g. 07-11-2026
  department: "UCPG" | "CPSD";
  totalQueries: number;
  categories: CategorySnapshot[];
  timestamp: number;
}

export interface CategoryDiff {
  category: string;
  currentCount: number;
  previousCount: number;
  delta: number; // current - previous
  isNew: boolean;
}

export interface ReportDiffResult {
  hasPrevious: boolean;
  previousDate?: string;
  totalDelta: number;
  totalPercentChange: number; // e.g. +12%
  categoryDiffs: CategoryDiff[];
}

const STORAGE_KEY = "meghdoot_daily_report_history_v1";

export function loadReportHistory(): DailyReportSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error("Failed to load daily report history:", e);
    return [];
  }
}

export function saveReportSnapshot(
  reportDate: string,
  formattedDate: string,
  department: "UCPG" | "CPSD",
  totalQueries: number,
  categories: CategorySnapshot[]
): DailyReportSnapshot {
  const history = loadReportHistory();
  const id = `${department}_${reportDate}_${Date.now()}`;

  const snapshot: DailyReportSnapshot = {
    id,
    reportDate,
    formattedDate,
    department,
    totalQueries,
    categories,
    timestamp: Date.now(),
  };

  // Replace existing snapshot for same department and date if exists, or prepend
  const filtered = history.filter(
    (h) => !(h.department === department && h.reportDate === reportDate)
  );

  const updated = [snapshot, ...filtered].slice(0, 30); // Keep last 30 reports

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save report history:", e);
    }
  }

  return snapshot;
}

export function compareWithPreviousReport(
  current: {
    department: "UCPG" | "CPSD";
    reportDate: string;
    totalQueries: number;
    categories: CategorySnapshot[];
  },
  history: DailyReportSnapshot[]
): ReportDiffResult {
  // Find the most recent previous report for same department (excluding current date if already in history)
  const previous = history.find(
    (h) => h.department === current.department && h.reportDate !== current.reportDate
  );

  if (!previous || previous.totalQueries === 0) {
    return {
      hasPrevious: false,
      totalDelta: 0,
      totalPercentChange: 0,
      categoryDiffs: current.categories.map((c) => ({
        category: c.category,
        currentCount: c.count,
        previousCount: 0,
        delta: c.count,
        isNew: true,
      })),
    };
  }

  const prevCatMap = new Map<string, number>();
  for (const pc of previous.categories) {
    prevCatMap.set(pc.category.toLowerCase(), pc.count);
  }

  const categoryDiffs: CategoryDiff[] = current.categories.map((c) => {
    const prevCount = prevCatMap.get(c.category.toLowerCase()) ?? 0;
    const delta = c.count - prevCount;
    return {
      category: c.category,
      currentCount: c.count,
      previousCount: prevCount,
      delta,
      isNew: prevCount === 0,
    };
  });

  const totalDelta = current.totalQueries - previous.totalQueries;
  const totalPercentChange = Math.round((totalDelta / previous.totalQueries) * 100);

  return {
    hasPrevious: true,
    previousDate: previous.formattedDate || previous.reportDate,
    totalDelta,
    totalPercentChange,
    categoryDiffs,
  };
}
