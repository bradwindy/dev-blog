"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  filename?: string;
}

export function CodeBlock({ children, className, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const code = extractCode(children);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      {filename && (
        <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border-b text-sm text-muted-foreground">
          <span>{filename}</span>
        </div>
      )}
      <div className={cn("relative", filename && "rounded-t-none")}>
        <pre className={cn("overflow-x-auto", className)}>{children}</pre>
        <button
          onClick={copyToClipboard}
          className="absolute right-2 top-2 p-2 rounded-md bg-muted/80 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function extractCode(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractCode).join("");
  }
  if (
    children &&
    typeof children === "object" &&
    "props" in children
  ) {
    const childProps = (children as { props?: { children?: React.ReactNode } }).props;
    if (childProps?.children) {
      return extractCode(childProps.children);
    }
  }
  return "";
}
