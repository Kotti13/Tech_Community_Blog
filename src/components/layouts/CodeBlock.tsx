import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { twilight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  // Handle language aliases
  const getLanguage = (lang: string): string => {
    const aliases: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'jsx',
      tsx: 'tsx',
      html: 'html',
      css: 'css',
      json: 'json',
      py: 'python',
      rb: 'ruby',
      go: 'go',
      java: 'java',
      php: 'php',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      '': 'text' // Default if no language is specified
    };

    return aliases[lang.toLowerCase()] || lang.toLowerCase();
  };

  // Custom styling for the code blocks
  const customStyle = {
    borderRadius: '0.5rem',
    padding: '1rem',
    margin: '1.5rem 0',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    fontFamily: '"Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div className="code-block-wrapper relative">
      {language && (
        <div className="code-language-label absolute top-0 right-0 rounded-bl-md rounded-tr-md px-3 py-1 bg-neutral-700 text-xs text-neutral-300 font-mono uppercase">
          {language}
        </div>
      )}
      <SyntaxHighlighter 
        language={getLanguage(language)}
        style={twilight}
        customStyle={customStyle}
        showLineNumbers={true}
        wrapLongLines={true}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;