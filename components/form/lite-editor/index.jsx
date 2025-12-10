"use client";

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Minus,
  Eye,
  Edit3,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MarkdownPreview } from "./MarkdownPreview";

/**
 * LiteEditor - Lightweight Markdown/HTML Rich Text Editor
 * 
 * Features:
 * - Markdown syntax support
 * - Live preview
 * - Toolbar for common formatting
 * - HTML output option
 * 
 * @param {Object} props
 * @param {string} props.value - The markdown content
 * @param {function} props.onChange - Callback when content changes
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.minHeight - Minimum height in pixels
 * @param {boolean} props.disabled - Disable editing
 * @param {string} props.className - Additional CSS classes
 * @param {"markdown"|"html"|"both"} props.mode - Editor mode
 */
export const LiteEditor = forwardRef(function LiteEditor({
  value = "",
  onChange,
  placeholder = "Write your content here...",
  minHeight = 200,
  disabled = false,
  className,
  mode = "markdown",
  showPreview = true,
}, ref) {
  const [activeTab, setActiveTab] = useState("write");
  const textareaRef = useRef(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    getValue: () => value,
    insertText: (text) => insertAtCursor(text),
  }));

  // Insert text at cursor position
  const insertAtCursor = useCallback((text, wrapStart = "", wrapEnd = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText;
    let newCursorPos;

    if (selectedText) {
      // Wrap selected text
      newText = value.substring(0, start) + wrapStart + selectedText + wrapEnd + value.substring(end);
      newCursorPos = start + wrapStart.length + selectedText.length + wrapEnd.length;
    } else {
      // Insert at cursor
      newText = value.substring(0, start) + text + value.substring(end);
      newCursorPos = start + text.length;
    }

    onChange?.(newText);

    // Restore cursor position after React re-render
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  // Toolbar actions
  const toolbarActions = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertAtCursor("**text**", "**", "**"),
      shortcut: "Ctrl+B",
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertAtCursor("*text*", "*", "*"),
      shortcut: "Ctrl+I",
    },
    { type: "divider" },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertAtCursor("\n# Heading\n"),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertAtCursor("\n## Heading\n"),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertAtCursor("\n### Heading\n"),
    },
    { type: "divider" },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertAtCursor("\n- Item 1\n- Item 2\n- Item 3\n"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertAtCursor("\n1. Item 1\n2. Item 2\n3. Item 3\n"),
    },
    { type: "divider" },
    {
      icon: Link2,
      label: "Link",
      action: () => insertAtCursor("[link text](https://example.com)", "[", "](url)"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertAtCursor("\n> Quote text\n"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertAtCursor("`code`", "`", "`"),
    },
    {
      icon: Minus,
      label: "Horizontal Rule",
      action: () => insertAtCursor("\n---\n"),
    },
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          insertAtCursor("**text**", "**", "**");
          break;
        case "i":
          e.preventDefault();
          insertAtCursor("*text*", "*", "*");
          break;
        case "k":
          e.preventDefault();
          insertAtCursor("[link text](url)", "[", "](url)");
          break;
      }
    }
  }, [insertAtCursor]);

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-b bg-muted/30 flex-wrap">
        {toolbarActions.map((item, index) => {
          if (item.type === "divider") {
            return (
              <div
                key={`divider-${index}`}
                className="w-px h-5 bg-border mx-1"
              />
            );
          }

          const Icon = item.icon;
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={item.action}
                  disabled={disabled}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {item.label}
                {item.shortcut && (
                  <span className="ml-2 text-muted-foreground">{item.shortcut}</span>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Preview toggle */}
        {showPreview && (
          <div className="ml-auto flex items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-7 p-0.5">
                <TabsTrigger value="write" className="h-6 px-2 text-xs gap-1">
                  <Edit3 className="h-3 w-3" />
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-6 px-2 text-xs gap-1">
                  <Eye className="h-3 w-3" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {/* Content area */}
      <div style={{ minHeight }}>
        {activeTab === "write" ? (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm"
            style={{ minHeight }}
          />
        ) : (
          <div
            className="p-4 overflow-auto"
            style={{ minHeight }}
          >
            <MarkdownPreview content={value} />
          </div>
        )}
      </div>
    </div>
  );
});

// Export for form integration
export default LiteEditor;
