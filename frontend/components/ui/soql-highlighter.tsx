import * as React from "react";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
// We use a custom theme or just tailwind colors, but Prism adds token classes like `token keyword`.
// Let's define the custom CSS for Prism tokens.

export function SOQLHighlighter({ query, className }: { query?: string; className?: string }) {
  const [highlighted, setHighlighted] = React.useState("");

  React.useEffect(() => {
    // Prism's SQL grammar works perfectly for SOQL
    const html = Prism.highlight(query || "", Prism.languages.sql!, "sql");
    setHighlighted(html);
  }, [query]);

  return (
    <pre 
      className={`language-sql ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: highlighted || query || "" }}
    />
  );
}
