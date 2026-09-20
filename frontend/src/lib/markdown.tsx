import React from "react";

/**
 * Minimal Markdown renderer for article and case-study bodies.
 *
 * Deliberately hand-written rather than pulled from a library, for one reason:
 * it produces React elements and never touches `dangerouslySetInnerHTML`. Body
 * content comes from the database, so even though only administrators can
 * write it, rendering it as raw HTML would turn a compromised admin account
 * into stored XSS against every visitor. Here the worst case is that unknown
 * syntax renders as literal text.
 *
 * Supported: ATX headings (##, ###), paragraphs, unordered and ordered lists,
 * blockquotes, fenced code blocks, and the inline forms **bold**, *italic*,
 * `code` and [text](https://url).
 */

type Token =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "code"; language: string | null; lines: string[] };

function tokenize(markdown: string): Token[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const tokens: Token[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    // Fenced code block
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1; // closing fence
      tokens.push({ type: "code", language: fence[1] || null, lines: body });
      continue;
    }

    // Heading
    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      tokens.push({
        type: "heading",
        level: heading[1].length as 2 | 3 | 4,
        text: heading[2].trim(),
      });
      index += 1;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoted: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quoted.push(lines[index].slice(2));
        index += 1;
      }
      tokens.push({ type: "quote", lines: quoted });
      continue;
    }

    // Lists
    const unordered = /^[-*]\s+(.*)$/;
    const ordered = /^\d+\.\s+(.*)$/;
    if (unordered.test(line) || ordered.test(line)) {
      const isOrdered = ordered.test(line);
      const pattern = isOrdered ? ordered : unordered;
      const items: string[] = [];
      while (index < lines.length && pattern.test(lines[index])) {
        items.push(lines[index].match(pattern)![1]);
        index += 1;
      }
      tokens.push({ type: "list", ordered: isOrdered, items });
      continue;
    }

    // Paragraph: consume until a blank line or the start of another block.
    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{2,4}\s|>\s|```|[-*]\s|\d+\.\s)/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    tokens.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return tokens;
}

/** Split inline text into React nodes. Anything unmatched stays literal text. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let counter = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${counter++}`;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-accent-300"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const link = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) {
        const [, label, href] = link;
        // Only http(s) and site-relative links are rendered as anchors; a
        // javascript: or data: URL falls through to plain text.
        const safe = /^https?:\/\//i.test(href) || href.startsWith("/");
        nodes.push(
          safe ? (
            <a
              key={key}
              href={href}
              {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-accent-400 underline underline-offset-4 transition-colors hover:text-accent-300"
            >
              {label}
            </a>
          ) : (
            <span key={key}>{label}</span>
          ),
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const tokens = tokenize(content);

  return (
    <div className={className}>
      {tokens.map((token, index) => {
        const key = `token-${index}`;

        switch (token.type) {
          case "heading": {
            const Tag = (`h${token.level}` as const) satisfies "h2" | "h3" | "h4";
            const size =
              token.level === 2
                ? "text-2xl mt-12"
                : token.level === 3
                  ? "text-xl mt-10"
                  : "text-lg mt-8";
            return (
              <Tag key={key} className={`${size} font-display font-medium text-ink first:mt-0`}>
                {renderInline(token.text, key)}
              </Tag>
            );
          }

          case "paragraph":
            return (
              <p key={key} className="mt-5 text-[1.0625rem] leading-[1.75] text-ink-muted">
                {renderInline(token.text, key)}
              </p>
            );

          case "list": {
            const Tag = token.ordered ? "ol" : "ul";
            return (
              <Tag key={key} className="mt-5 space-y-2.5 pl-1">
                {token.items.map((item, itemIndex) => (
                  <li
                    key={`${key}-${itemIndex}`}
                    className="flex gap-3 text-[1.0625rem] leading-[1.75] text-ink-muted"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 shrink-0 font-mono text-xs text-accent-500"
                    >
                      {token.ordered ? `${itemIndex + 1}.` : "•"}
                    </span>
                    <span>{renderInline(item, `${key}-${itemIndex}`)}</span>
                  </li>
                ))}
              </Tag>
            );
          }

          case "quote":
            return (
              <blockquote
                key={key}
                className="mt-8 border-l-2 border-accent-500/50 bg-surface/50 py-4 pl-6 pr-4 text-[1.0625rem] italic leading-[1.7] text-ink-muted"
              >
                {token.lines.map((line, lineIndex) => (
                  <p key={`${key}-${lineIndex}`} className={lineIndex > 0 ? "mt-3" : ""}>
                    {renderInline(line, `${key}-${lineIndex}`)}
                  </p>
                ))}
              </blockquote>
            );

          case "code":
            return (
              <pre
                key={key}
                className="mt-6 overflow-x-auto rounded-card border border-hairline bg-surface-2 p-5 font-mono text-sm leading-relaxed text-ink-muted"
              >
                <code>{token.lines.join("\n")}</code>
              </pre>
            );
        }
      })}
    </div>
  );
}

/** Plain text extraction, used for reading time and meta descriptions. */
export function markdownToPlainText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*`_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
