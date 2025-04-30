import React from 'react';
import CodeBlock from '../components/layouts/CodeBlock';

// Regular expression to match code blocks with optional language
const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)```/g;

export const useContentParser = (content: string) => {
  if (!content) return null;

  // Split the content by code blocks
  const segments = [];
  let lastIndex = 0;
  let match;

  // Create a new regex instance for each execution to avoid state issues
  const regex = new RegExp(codeBlockRegex);
  
  while ((match = regex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }
    
    // Add code block
    segments.push({
      type: 'code',
      language: match[1].trim() || 'text', // Default to 'text' if no language specified
      content: match[2].trim()
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last code block (if any)
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }
  
  // Render the segments
  const renderContent = () => {
    return segments.map((segment, index) => {
      if (segment.type === 'text') {
        // Split text by newlines and create paragraph elements
        return (
          <div key={index} className="mb-4">
            {segment.content.split('\n\n').map((paragraph, pIndex) => (
              <p key={`p-${index}-${pIndex}`} className="mb-4 text-gray-800 dark:text-gray-200">
                {paragraph}
              </p>
            ))}
          </div>
        );
      } else if (segment.type === 'code') {
        // For code blocks, use the CodeBlock component
        return (
          <CodeBlock 
            key={`code-${index}`}
            language={segment.language}
            value={segment.content}
          />
        );
      }
      return null;
    });
  };
  
  return renderContent();
};