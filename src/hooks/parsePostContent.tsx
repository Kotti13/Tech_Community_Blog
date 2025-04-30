import React from 'react';
import { Prism as SyntaxHighlighter, SyntaxHighlighterProps } from 'prism-react-renderer';
import DOMPurify from 'dompurify';

type Language = 
  | 'javascript' 
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'html'
  | 'css'
  | 'python'
  | 'java'
  | 'php'
  | 'sql'
  | 'bash'
  | string;

interface CodeBlockProps {
  code: string;
  language?: Language;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

/**
 * Sanitizes code content to prevent XSS attacks
 * @param code - The code content to sanitize
 * @returns Sanitized code
 */
export const sanitizeCode = (code: string): string => {
  return DOMPurify.sanitize(code, {
    ALLOWED_TAGS: [], // Remove all HTML tags
    KEEP_CONTENT: true // Keep the text content
  });
};

/**
 * Detects the programming language from the code block metadata or content
 * @param language - Explicitly provided language
 * @param code - The code content for auto-detection
 * @returns Detected language (defaults to 'typescript')
 */
export const detectLanguage = (
  language: Language | undefined, 
  code: string
): Language => {
  if (language) return language.toLowerCase() as Language;

  // Enhanced auto-detection
  if (/<\?php/.test(code)) return 'php';
  if (/<(html|div|span|p)[\s>]/.test(code)) return 'html';
  if (/(def|import)\s+\w+/.test(code)) return 'python';
  if (/package\s+[\w.]+;/.test(code)) return 'java';
  if (/<\w+.*?>.*?<\/\w+>/.test(code)) return 'html';
  if (/\(ts\)/.test(code) || /:\s*\w+[\s;]/.test(code)) return 'typescript';
  if (/\(js\)/.test(code) || /function\s+\w+\(/.test(code)) return 'javascript';
  if (/import React|<\/?[A-Z]/.test(code)) return 'jsx';
  if (/import React.*from 'react'|interface \w+|type \w+/.test(code)) return 'tsx';
  if (/#\w+|\.\w+\s*\{/.test(code)) return 'css';
  if (/SELECT|INSERT|UPDATE|DELETE/.test(code)) return 'sql';
  if (/^\$|echo|git|npm|yarn/.test(code)) return 'bash';

  return 'typescript'; // Default for your React/TSX blog
};

/**
 * React component to render a syntax-highlighted code block
 * @param props - CodeBlock configuration
 * @returns React component
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showLineNumbers = true,
  highlightLines = [],
}) => {
  const sanitizedCode = sanitizeCode(code);
  const detectedLanguage = detectLanguage(language, sanitizedCode);

  return (
    <SyntaxHighlighter
      language={detectedLanguage}
      showLineNumbers={showLineNumbers}
      wrapLines={true}
      lineProps={(lineNumber) => {
        const style: React.CSSProperties = {};
        if (highlightLines.includes(lineNumber)) {
          style.backgroundColor = 'rgba(255, 255, 0, 0.1)';
          style.display = 'block';
        }
        return { style };
      }}
      customStyle={{
        borderRadius: '4px',
        padding: '16px',
        fontSize: '14px',
        backgroundColor: '#f5f5f5',
      }}
    >
      {sanitizedCode}
    </SyntaxHighlighter>
  );
};

/**
 * Extracts code blocks from markdown or custom content
 * @param content - The content to parse
 * @returns Array of code blocks with metadata
 */
export const extractCodeBlocks = (
  content: string
): Array<{ code: string; language: Language }> => {
  const codeBlocks: Array<{ code: string; language: Language }> = [];
  
  // Example for markdown-style code blocks
  const markdownPattern = /```(\w+)?\n([\s\S]+?)\n```/g;
  let match;
  
  while ((match = markdownPattern.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] as Language || 'typescript',
      code: match[2]
    });
  }

  return codeBlocks;
};