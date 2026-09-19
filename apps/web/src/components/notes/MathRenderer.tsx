'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className }: MathRendererProps) {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Regex to match block math $$...$$ and inline math $...$
    // Replace math blocks with rendered KaTeX HTML strings
    const blockRegex = /\$\$\s*([\s\S]*?)\s*\$\$/g;
    const inlineRegex = /\$([^\$\n]+?)\$/g;

    let result = content;

    // Render block math
    result = result.replace(blockRegex, (_match, math) => {
      try {
        return `<div class="my-3 text-center overflow-x-auto py-2">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch {
        return `<div>${math}</div>`;
      }
    });

    // Render inline math
    result = result.replace(inlineRegex, (_match, math) => {
      try {
        return `<span class="inline-block px-1">${katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })}</span>`;
      } catch {
        return `<span>${math}</span>`;
      }
    });

    return result;
  }, [content]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
