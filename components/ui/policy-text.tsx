import React from "react";

/**
 * Renders the tiny policy markup used by the admin-editable Privacy Policy:
 * "## " heading, "- " bullet, blank line = new paragraph. Plain text only (no HTML),
 * so admin-entered text can never inject markup.
 */
export function PolicyText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        if (lines.length === 0) return null;

        const heading = lines[0].startsWith("## ") ? lines[0].slice(3) : null;
        const body = heading ? lines.slice(1) : lines;
        const bullets = body.filter((l) => l.startsWith("- "));
        const paragraphs = body.filter((l) => !l.startsWith("- "));

        return (
          <section key={i} className="space-y-2">
            {heading && <h2 className="text-sm font-bold uppercase tracking-wider text-white">{heading}</h2>}
            {paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-1">
                {bullets.map((b, j) => (
                  <li key={j}>{b.slice(2)}</li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
