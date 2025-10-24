"use client"

import * as React from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Undo,
  Redo,
  Type,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * RichTextEditor - Enterprise rich text editing component
 * 
 * A powerful WYSIWYG editor for document creation and editing.
 * Built with ContentEditable and can be easily upgraded to use
 * TipTap, Quill, or Slate for more advanced features.
 * 
 * Features:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Headings (H1, H2, H3)
 * - Lists (ordered, unordered)
 * - Text alignment
 * - Links and images
 * - Code blocks and quotes
 * - Undo/Redo
 * - Keyboard shortcuts
 * - Accessible (ARIA)
 * 
 * @example
 * const [content, setContent] = useState('')
 * 
 * <RichTextEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Start writing..."
 *   maxLength={5000}
 * />
 */

export interface RichTextEditorProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  maxLength?: number
  minHeight?: string
  maxHeight?: string
  className?: string
  editorClassName?: string
  showToolbar?: boolean
  showCharCount?: boolean
  autoFocus?: boolean
  
  // Toolbar customization
  toolbarGroups?: ToolbarGroup[]
}

export type ToolbarGroup = "formatting" | "headings" | "lists" | "alignment" | "insert" | "history"

const defaultToolbarGroups: ToolbarGroup[] = [
  "formatting",
  "headings",
  "lists",
  "alignment",
  "insert",
  "history",
]

export function RichTextEditor({
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder = "Start writing...",
  disabled = false,
  readOnly = false,
  maxLength,
  minHeight = "200px",
  maxHeight = "500px",
  className,
  editorClassName,
  showToolbar = true,
  showCharCount = true,
  autoFocus = false,
  toolbarGroups = defaultToolbarGroups,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  
  // Support both controlled and uncontrolled
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  React.useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus()
    }
  }, [autoFocus])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML
    
    if (maxLength && content.length > maxLength) {
      return
    }

    if (!isControlled) {
      setInternalValue(content)
    }
    onChange?.(content)
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      execCommand("insertImage", url)
    }
  }

  const getCharCount = () => {
    const text = editorRef.current?.textContent || ""
    return text.length
  }

  const toolbarButtons = {
    formatting: [
      { icon: Bold, command: "bold", title: "Bold (Ctrl+B)", shortcut: "Ctrl+B" },
      { icon: Italic, command: "italic", title: "Italic (Ctrl+I)", shortcut: "Ctrl+I" },
      { icon: Underline, command: "underline", title: "Underline (Ctrl+U)", shortcut: "Ctrl+U" },
      { icon: Strikethrough, command: "strikeThrough", title: "Strikethrough", shortcut: "" },
    ],
    headings: [
      { icon: Heading1, command: "formatBlock", value: "h1", title: "Heading 1", shortcut: "" },
      { icon: Heading2, command: "formatBlock", value: "h2", title: "Heading 2", shortcut: "" },
      { icon: Heading3, command: "formatBlock", value: "h3", title: "Heading 3", shortcut: "" },
      { icon: Type, command: "formatBlock", value: "p", title: "Paragraph", shortcut: "" },
    ],
    lists: [
      { icon: List, command: "insertUnorderedList", title: "Bullet List", shortcut: "" },
      { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List", shortcut: "" },
    ],
    alignment: [
      { icon: AlignLeft, command: "justifyLeft", title: "Align Left", shortcut: "" },
      { icon: AlignCenter, command: "justifyCenter", title: "Align Center", shortcut: "" },
      { icon: AlignRight, command: "justifyRight", title: "Align Right", shortcut: "" },
      { icon: AlignJustify, command: "justifyFull", title: "Justify", shortcut: "" },
    ],
    insert: [
      { icon: Link, command: "custom", action: insertLink, title: "Insert Link", shortcut: "Ctrl+K" },
      { icon: Image, command: "custom", action: insertImage, title: "Insert Image", shortcut: "" },
      { icon: Code, command: "formatBlock", value: "pre", title: "Code Block", shortcut: "" },
      { icon: Quote, command: "formatBlock", value: "blockquote", title: "Quote", shortcut: "" },
    ],
    history: [
      { icon: Undo, command: "undo", title: "Undo (Ctrl+Z)", shortcut: "Ctrl+Z" },
      { icon: Redo, command: "redo", title: "Redo (Ctrl+Y)", shortcut: "Ctrl+Y" },
    ],
  }

  const renderToolbarGroup = (group: ToolbarGroup) => {
    const buttons = toolbarButtons[group]
    if (!buttons) return null

    return (
      <div key={group} className="flex items-center gap-1">
        {buttons.map((button, index) => {
          const Icon = button.icon
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      if (button.action) {
                        button.action()
                      } else {
                        execCommand(button.command, button.value)
                      }
                    }}
                    disabled={disabled || readOnly}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{button.title}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{button.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col rounded-lg border", className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/30">
          {toolbarGroups.map((group, index) => (
            <React.Fragment key={group}>
              {index > 0 && <Separator orientation="vertical" className="h-8" />}
              {renderToolbarGroup(group)}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled && !readOnly}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className={cn(
          "prose prose-sm max-w-none p-4 focus:outline-none overflow-auto",
          "min-h-[var(--min-height)] max-h-[var(--max-height)]",
          !value && "before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none",
          disabled && "opacity-50 cursor-not-allowed",
          readOnly && "cursor-default",
          editorClassName
        )}
        style={
          {
            "--min-height": minHeight,
            "--max-height": maxHeight,
          } as React.CSSProperties
        }
        data-placeholder={placeholder}
        role="textbox"
        aria-label="Rich text editor"
        aria-multiline="true"
        aria-disabled={disabled}
        aria-readonly={readOnly}
      />

      {/* Footer */}
      {showCharCount && maxLength && (
        <div className="flex items-center justify-end border-t px-4 py-2 text-xs text-muted-foreground">
          <span>
            {getCharCount()} / {maxLength}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * RichTextViewer - Display rich text content (read-only)
 * 
 * @example
 * <RichTextViewer content={article.content} />
 */

export interface RichTextViewerProps {
  content: string
  className?: string
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  return (
    <div
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

/**
 * useRichTextEditor - Hook for managing rich text editor state
 * 
 * @example
 * const editor = useRichTextEditor({ initialValue: '<p>Hello</p>' })
 * 
 * <RichTextEditor
 *   value={editor.value}
 *   onChange={editor.setValue}
 * />
 */

export interface UseRichTextEditorOptions {
  initialValue?: string
  maxLength?: number
  onChange?: (value: string) => void
}

export function useRichTextEditor({
  initialValue = "",
  maxLength,
  onChange,
}: UseRichTextEditorOptions = {}) {
  const [value, setValue] = React.useState(initialValue)

  const handleChange = React.useCallback(
    (newValue: string) => {
      if (maxLength && newValue.length > maxLength) {
        return
      }
      setValue(newValue)
      onChange?.(newValue)
    },
    [maxLength, onChange]
  )

  const clear = React.useCallback(() => {
    setValue("")
    onChange?.("")
  }, [onChange])

  const getPlainText = React.useCallback(() => {
    const div = document.createElement("div")
    div.innerHTML = value
    return div.textContent || div.innerText || ""
  }, [value])

  const getCharCount = React.useCallback(() => {
    return getPlainText().length
  }, [getPlainText])

  const isMaxLength = React.useCallback(() => {
    if (!maxLength) return false
    return getCharCount() >= maxLength
  }, [getCharCount, maxLength])

  return {
    value,
    setValue: handleChange,
    clear,
    getPlainText,
    getCharCount,
    isMaxLength,
  }
}

/**
 * Utility: Sanitize HTML content
 * Remove dangerous scripts and attributes
 */

export function sanitizeHtml(html: string): string {
  const div = document.createElement("div")
  div.innerHTML = html

  // Remove script tags
  const scripts = div.querySelectorAll("script")
  scripts.forEach((script) => script.remove())

  // Remove dangerous attributes
  const allElements = div.querySelectorAll("*")
  allElements.forEach((element) => {
    const attrs = element.attributes
    for (let i = attrs.length - 1; i >= 0; i--) {
      const attr = attrs[i]
      if (attr.name.startsWith("on")) {
        element.removeAttribute(attr.name)
      }
    }
  })

  return div.innerHTML
}

/**
 * Utility: Convert HTML to plain text
 */

export function htmlToPlainText(html: string): string {
  const div = document.createElement("div")
  div.innerHTML = html
  return div.textContent || div.innerText || ""
}

/**
 * Utility: Word count
 */

export function getWordCount(html: string): number {
  const text = htmlToPlainText(html)
  return text.trim().split(/\s+/).filter(Boolean).length
}

