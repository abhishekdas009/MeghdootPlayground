"use client";

import React, { useState, useEffect } from "react";
import { getTodayHighlight, type HighlightData } from "@/lib/today-highlight-logic";
import { FUNNY_TECH_QUOTES } from "@/lib/today-highlight-data";

export function TypewriterQuotes() {
  const [highlight, setHighlight] = useState<HighlightData | null>(null);
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setHighlight(getTodayHighlight());
    setIsMounted(true);
  }, []);

  const activeQuotes = React.useMemo(() => {
    // If today is a festival or special day with a specific quote, put it first!
    const quotes = [...FUNNY_TECH_QUOTES];
    // Shuffle the quotes so they are random for the user
    for (let i = quotes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = quotes[i];
      if (temp !== undefined && quotes[j] !== undefined) {
        quotes[i] = quotes[j] as string;
        quotes[j] = temp;
      }
    }

    if (highlight && highlight.category !== "FUNNY / LIGHTHEARTED CONTENT" && highlight.quote) {
      const prefix = highlight.category === "INDIAN FESTIVALS & CELEBRATIONS" 
        ? highlight.fact // For festivals, fact contains the wishes
        : `${highlight.title}:`;
      quotes.unshift(`${prefix} ${highlight.quote}`);
    }
    return quotes;
  }, [highlight]);

  // We need subIndex to be initialized based on the activeQuotes, but safely for SSR hydration.
  // SSR will render QUOTES[0] from the previous static implementation or just a blank/fallback.
  // To prevent hydration errors, we render the first item of FUNNY_TECH_QUOTES completely.
  const [subIndex, setSubIndex] = useState(FUNNY_TECH_QUOTES[0]?.length || 0);

  useEffect(() => {
    if (!isMounted) return;
    setSubIndex(activeQuotes[0]?.length || 0);
    setIndex(0);
    setIsDeleting(false);
  }, [isMounted, activeQuotes]);

  useEffect(() => {
    const timeout = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  useEffect(() => {
    if (!isMounted) return;

    if (index >= activeQuotes.length) {
      setIndex(0);
      return;
    }

    if (subIndex === (activeQuotes[index]?.length || 0) + 1 && !isDeleting) {
      const timer = setTimeout(() => setIsDeleting(true), 4000); // Wait 4s before deleting
      return () => clearTimeout(timer);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % activeQuotes.length);
      return;
    }

    const timer = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 30 : 60);

    return () => clearTimeout(timer);
  }, [subIndex, index, isDeleting, activeQuotes, isMounted]);

  // Initial SSR render fallback to match hydration
  if (!isMounted) {
    return (
      <span className="inline-flex min-h-[1.5em]">
        <span>{FUNNY_TECH_QUOTES[0]}</span>
        <span className="w-0.5 h-5 bg-blue-500 ml-1 inline-block align-text-bottom opacity-100" />
      </span>
    );
  }

  return (
    <span className="inline-flex min-h-[1.5em]">
      <span>{activeQuotes[index]?.substring(0, subIndex)}</span>
      <span
        className={`w-0.5 h-5 bg-blue-500 ml-1 inline-block align-text-bottom ${
          blink ? "opacity-100" : "opacity-0"
        } transition-opacity duration-100`}
      />
    </span>
  );
}
