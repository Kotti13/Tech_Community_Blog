import React from 'react';
import { useContentParser } from './useContentParser';

export const useFilteredContent = (content: string) => {
  // Sanitize and process the content before parsing
  const sanitizedContent = content
    // Ensure proper code block formatting
    .replace(/```(\w+)?\n/g, '```$1\n') // Fix code block syntax
    .replace(/```\s*$/g, '\n```') // Ensure closing code block has newline
    .trim();

  // Pass the sanitized content to the parser
  return useContentParser(sanitizedContent);
};