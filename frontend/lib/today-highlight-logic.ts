import { FESTIVALS_DATES, FESTIVAL_QUOTES } from "./festivals";
import { FUNNY_TECH_QUOTES, STATIC_FESTIVALS, HISTORICAL_EVENTS } from "./today-highlight-data";

export type HighlightData = {
  category: string;
  title: string;
  description: string;
  dateFormatted: string;
  historicalYear?: number;
  fact: string;
  quote?: string;
};

export function getTodayHighlight(): HighlightData {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayISO = `${yyyy}-${mm}-${dd}`;
  
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateFormatted = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  // Priority 1: Indian Festival from dynamic dates
  const dynamicFestivalName = FESTIVALS_DATES[todayISO];
  if (dynamicFestivalName && FESTIVAL_QUOTES[dynamicFestivalName]) {
    const fest = FESTIVAL_QUOTES[dynamicFestivalName];
    return {
      category: "INDIAN FESTIVALS & CELEBRATIONS",
      title: dynamicFestivalName,
      description: `Today we celebrate ${dynamicFestivalName}.`,
      dateFormatted,
      fact: fest.wishes,
      quote: fest.quote,
    };
  }

  // Priority 2 & 3: Static Festivals & International Days
  const staticFest = STATIC_FESTIVALS?.find(f => f.month === month && f.day === day);
  if (staticFest) {
    return {
      category: staticFest.category || "NATIONAL & INTERNATIONAL DAYS",
      title: staticFest.title,
      description: staticFest.description,
      dateFormatted,
      historicalYear: staticFest.historicalYear,
      fact: staticFest.fact,
      quote: staticFest.quote || getRandomTechQuote(todayISO),
    };
  }

  // Priority 4: Historical Events
  const histEvent = HISTORICAL_EVENTS?.find(e => e.month === month && e.day === day);
  if (histEvent) {
    return {
      category: histEvent.category || "HISTORICAL EVENTS",
      title: histEvent.title,
      description: histEvent.description,
      dateFormatted,
      historicalYear: histEvent.historicalYear,
      fact: histEvent.fact,
      quote: histEvent.quote || getRandomTechQuote(todayISO),
    };
  }

  // Fallback: Just a funny tech quote as the highlight
  const fallbackQuote = getRandomTechQuote(todayISO);
  return {
    category: "FUNNY / LIGHTHEARTED CONTENT",
    title: "Just Another Day in IT",
    description: "No major historical events today, so here's something to keep you going.",
    dateFormatted,
    fact: "Did you know? The first computer bug was an actual moth found trapped in a Harvard Mark II computer in 1947.",
    quote: fallbackQuote,
  };
}

function getRandomTechQuote(seedString: string): string {
  if (!FUNNY_TECH_QUOTES || FUNNY_TECH_QUOTES.length === 0) return "Works on my machine.";
  // Simple seeded random to keep the quote consistent for the day
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FUNNY_TECH_QUOTES.length;
  return FUNNY_TECH_QUOTES[index] || "Works on my machine.";
}
