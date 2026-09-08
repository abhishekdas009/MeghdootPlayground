code = """import * as React from "react";

export function EmptyActivityIllustration({ className }: { className?: string }) {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="30" y="20" width="60" height="50" rx="12" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
      <path d="M45 45L55 55L75 35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="15" cy="30" r="4" fill="currentColor" opacity="0.4"/>
      <circle cx="105" cy="65" r="6" fill="currentColor" opacity="0.2"/>
      <circle cx="95" cy="15" r="3" fill="currentColor" opacity="0.5"/>
      <path d="M35 75L25 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      <path d="M85 20L95 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

export function NoResultsIllustration({ className }: { className?: string }) {
  return (
    <svg width="150" height="110" viewBox="0 0 150 110" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M75 95C105.376 95 130 77.0914 130 55C130 32.9086 105.376 15 75 15C44.6243 15 20 32.9086 20 55C20 77.0914 44.6243 95 75 95Z" fill="currentColor" fillOpacity="0.05"/>
      <rect x="45" y="35" width="60" height="45" rx="8" fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray="6 4" />
      <path d="M55 50H95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <path d="M55 60H75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <circle cx="95" cy="75" r="14" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3"/>
      <path d="M105 85L115 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <path d="M30 30L35 25M35 35L40 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <circle cx="120" cy="30" r="4" fill="currentColor" opacity="0.3"/>
      <path d="M90 71L95 76L101 68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0"/> 
      {/* Intentionally hidden checkmark for 'no results' vibe, but we can draw an X instead */}
      <path d="M90 70L100 80M100 70L90 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
"""
with open("frontend/components/ui/illustrations.tsx", "w", encoding="utf-8") as f:
    f.write(code)
print("Created illustrations.tsx")
