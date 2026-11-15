with open("frontend/components/ui/typewriter-quotes.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_statement = 'import { getTodayFestival } from "@/lib/festivals";\n\n'

# Insert import at the top after "use client"; and React imports
content = content.replace('import React, { useState, useEffect } from "react";\n', 'import React, { useState, useEffect } from "react";\n' + import_statement)

# Replace the component body
new_component = """export function TypewriterQuotes() {
  const [festival, setFestival] = useState<{name: string; wishes: string; quote: string} | null>(null);
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setFestival(getTodayFestival());
    setIsMounted(true);
  }, []);

  const activeQuotes = festival ? [`${festival.wishes} ${festival.quote}`] : QUOTES;

  useEffect(() => {
    if (!isMounted) return;
    // Set initial subIndex for hydration match
    if (subIndex === 0 && !isDeleting && index === 0) {
       setSubIndex(activeQuotes[0]?.length || 0);
    }
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

    const delay = isDeleting 
      ? 15 // Fast delete
      : 35 + Math.random() * 25; // Variable typing speed

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, delay);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, isMounted, activeQuotes]);

  // Before hydration, render the first quote statically
  if (!isMounted) {
    return (
      <span className="min-h-[28px] inline-block font-medium">
        {QUOTES[0]}
      </span>
    );
  }

  return (
    <span className="min-h-[28px] inline-block font-medium">
      {(activeQuotes[index] || "").substring(0, subIndex)}
      <span className={`${blink ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100 font-black text-blue-500`}>|</span>
    </span>
  );
}"""

import re
pattern = r'export function TypewriterQuotes\(\).*'
content = re.sub(pattern, new_component, content, flags=re.DOTALL)

with open("frontend/components/ui/typewriter-quotes.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
