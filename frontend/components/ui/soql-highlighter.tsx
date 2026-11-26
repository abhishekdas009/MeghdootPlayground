"use client";

import * as React from "react";
import Prism from "prismjs";
import "prismjs/components/prism-sql";

const MAX_HIGHLIGHT_CHARS = 45_000;

export function SOQLHighlighter({ query, className }: { query?: string; className?: string }) {
  const rawQuery = query || "";
  const deferredQuery = React.useDeferredValue(rawQuery);

  const highlighted = React.useMemo(() => {
    if (!deferredQuery || deferredQuery.length > MAX_HIGHLIGHT_CHARS) {
      return null;
    }
    const grammar = Prism.languages.sql;
    if (!grammar) return null;
    return Prism.highlight(deferredQuery, grammar, "sql");
  }, [deferredQuery]);

  if (highlighted === null) {
    return (
      <pre className={`language-sql ${className || ""}`}>
        {rawQuery}
      </pre>
    );
  }

  return (
    <pre
      className={`language-sql ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}
