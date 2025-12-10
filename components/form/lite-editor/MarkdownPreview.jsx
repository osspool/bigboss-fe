"use client";

import { cn } from "@/lib/utils";

/**
 * MarkdownPreview - Renders markdown content as formatted HTML
 *
 * @param {Object} props
 * @param {string} props.content - The markdown content to render
 * @param {string} [props.className] - Additional CSS classes
 */
export function MarkdownPreview({ content, className = "" }) {
  if (!content) {
    return (
      <p className="text-muted-foreground italic">
        No content available
      </p>
    );
  }

  const html = parseMarkdown(content);

  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Parse markdown to HTML
 * Basic markdown parser for common formatting
 * For production, consider using a library like 'marked', 'markdown-it', or 'remark'
 */
function parseMarkdown(text) {
  let html = text;

  // Use placeholders for all markdown syntax BEFORE escaping HTML
  // Headers
  html = html.replace(/^### (.+)$/gm, "{{H3}}$1{{/H3}}");
  html = html.replace(/^## (.+)$/gm, "{{H2}}$1{{/H2}}");
  html = html.replace(/^# (.+)$/gm, "{{H1}}$1{{/H1}}");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "{{BLOCKQUOTE}}$1{{/BLOCKQUOTE}}");

  // Horizontal rules
  html = html.replace(/^---$/gm, "{{HR}}");

  // Lists - keep them separate with different markers
  // Ordered lists (mark FIRST before unordered to avoid conflicts)
  html = html.replace(/^\d+\. (.+)$/gm, "{{OL_ITEM}}$1{{/OL_ITEM}}");
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "{{UL_ITEM}}$1{{/UL_ITEM}}");

  // NOW escape HTML (our placeholders won't be affected)
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Inline formatting (bold, italic, code, links)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Replace placeholders with actual HTML elements
  // Headers
  html = html.replace(/{{H1}}(.+?){{\/H1}}/g, '<h1>$1</h1>');
  html = html.replace(/{{H2}}(.+?){{\/H2}}/g, '<h2>$1</h2>');
  html = html.replace(/{{H3}}(.+?){{\/H3}}/g, '<h3>$1</h3>');

  // Blockquotes
  html = html.replace(/{{BLOCKQUOTE}}(.+?){{\/BLOCKQUOTE}}/g, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/{{HR}}/g, '<hr />');

  // Lists - handle separately
  // First, convert unordered list items and wrap them
  html = html.replace(/({{UL_ITEM}}.+?{{\/UL_ITEM}}\n?)+/g, (match) => {
    const items = match.replace(/{{UL_ITEM}}(.+?){{\/UL_ITEM}}/g, '<li>$1</li>');
    return `<ul>${items}</ul>`;
  });

  // Then, convert ordered list items and wrap them
  html = html.replace(/({{OL_ITEM}}.+?{{\/OL_ITEM}}\n?)+/g, (match) => {
    const items = match.replace(/{{OL_ITEM}}(.+?){{\/OL_ITEM}}/g, '<li>$1</li>');
    return `<ol>${items}</ol>`;
  });

  // Paragraphs (wrap remaining non-empty lines that aren't already HTML elements)
  html = html.replace(/^(?!<[hluob]|<\/|{{)(.+)$/gm, "<p>$1</p>");

  // Clean up empty paragraphs and extra newlines
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "");
  html = html.replace(/\n{3,}/g, "\n\n");

  return html;
}

export default MarkdownPreview;
