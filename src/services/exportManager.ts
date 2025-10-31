/**
 * Export Manager
 * Enhanced export functionality with PDF, LaTeX, and custom formatting
 */

import { saveAs } from 'file-saver';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  format: ExportFormat;
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize?: 'A4' | 'Letter';
  includeMetadata?: boolean;
}

export type ExportFormat = 'txt' | 'md' | 'html' | 'docx' | 'pdf' | 'latex';

const DEFAULT_OPTIONS: Partial<ExportOptions> = {
  fontFamily: 'Times New Roman',
  fontSize: 12,
  lineSpacing: 1.5,
  margins: {
    top: 25.4,
    right: 25.4,
    bottom: 25.4,
    left: 25.4
  },
  pageSize: 'A4',
  includeMetadata: true
};

/**
 * Export document with custom options
 */
export async function exportDocument(
  content: string,
  fileName: string,
  options: ExportOptions
): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const baseFileName = fileName.replace(/\.[^/.]+$/, '');

  switch (options.format) {
    case 'txt':
      exportAsText(content, baseFileName);
      break;
    
    case 'md':
      exportAsMarkdown(content, baseFileName);
      break;
    
    case 'html':
      exportAsHtml(content, baseFileName, mergedOptions);
      break;
    
    case 'docx':
      await exportAsDocx(content, baseFileName, mergedOptions);
      break;
    
    case 'pdf':
      await exportAsPdf(content, baseFileName, mergedOptions);
      break;
    
    case 'latex':
      exportAsLatex(content, baseFileName);
      break;
    
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Export as plain text
 */
function exportAsText(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${fileName}.txt`);
}

/**
 * Export as Markdown
 */
function exportAsMarkdown(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${fileName}.md`);
}

/**
 * Export as HTML with custom styling
 */
function exportAsHtml(
  content: string,
  fileName: string,
  options: Partial<ExportOptions>
): void {
  const margins = options.margins || DEFAULT_OPTIONS.margins!;
  const fontFamily = options.fontFamily || DEFAULT_OPTIONS.fontFamily!;
  const fontSize = options.fontSize || DEFAULT_OPTIONS.fontSize!;
  const lineSpacing = options.lineSpacing || DEFAULT_OPTIONS.lineSpacing!;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    @page {
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    }
    body {
      font-family: '${fontFamily}', serif;
      font-size: ${fontSize}pt;
      line-height: ${lineSpacing};
      max-width: 210mm;
      margin: ${margins.top}mm auto;
      padding: 20px;
      color: #000;
      background: #fff;
    }
    p {
      margin-bottom: 1em;
      text-align: justify;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${convertMarkdownToHtml(content)}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${fileName}.html`);
}

/**
 * Export as DOCX with custom formatting
 */
async function exportAsDocx(
  content: string,
  fileName: string,
  options: Partial<ExportOptions>
): Promise<void> {
  const fontSize = (options.fontSize || 12) * 2; // Convert to half-points
  const paragraphs = content.split('\n').map(line => {
    const trimmedLine = line.trim();
    
    // Check for markdown headings
    if (trimmedLine.startsWith('#')) {
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const text = trimmedLine.replace(/^#+\s*/, '');
      
      return new Paragraph({
        text,
        heading: `Heading${Math.min(level, 6)}` as any,
        spacing: { before: 240, after: 120 }
      });
    }
    
    return new Paragraph({
      children: [new TextRun({
        text: line || ' ',
        size: fontSize
      })],
      spacing: { after: 200 }
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: paragraphs
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

/**
 * Export as PDF using jsPDF
 */
async function exportAsPdf(
  content: string,
  fileName: string,
  options: Partial<ExportOptions>
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: options.pageSize === 'Letter' ? 'letter' : 'a4'
  });

  const margins = options.margins || DEFAULT_OPTIONS.margins!;
  const fontSize = options.fontSize || DEFAULT_OPTIONS.fontSize!;
  const lineSpacing = options.lineSpacing || DEFAULT_OPTIONS.lineSpacing!;
  const fontFamily = options.fontFamily || DEFAULT_OPTIONS.fontFamily!;

  // Set font
  doc.setFont(fontFamily.toLowerCase().includes('times') ? 'times' : 'helvetica');
  doc.setFontSize(fontSize);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margins.left - margins.right;

  let y = margins.top;
  const lineHeight = fontSize * 0.3527 * lineSpacing; // Convert pt to mm

  // Split content into lines
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for markdown heading
    if (line.trim().startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');
      const headingSize = fontSize + (6 - level) * 2;
      
      doc.setFontSize(headingSize);
      doc.setFont(doc.getFont().fontName, 'bold');
      
      const wrappedLines = doc.splitTextToSize(text, maxWidth);
      for (const wrappedLine of wrappedLines) {
        if (y + lineHeight > pageHeight - margins.bottom) {
          doc.addPage();
          y = margins.top;
        }
        doc.text(wrappedLine, margins.left, y);
        y += lineHeight;
      }
      
      doc.setFontSize(fontSize);
      doc.setFont(doc.getFont().fontName, 'normal');
      y += lineHeight * 0.5; // Extra space after heading
    } else if (line.trim()) {
      // Regular text
      const wrappedLines = doc.splitTextToSize(line, maxWidth);
      
      for (const wrappedLine of wrappedLines) {
        if (y + lineHeight > pageHeight - margins.bottom) {
          doc.addPage();
          y = margins.top;
        }
        doc.text(wrappedLine, margins.left, y);
        y += lineHeight;
      }
    } else {
      // Empty line
      y += lineHeight;
    }
  }

  // Add metadata if requested
  if (options.includeMetadata) {
    doc.setProperties({
      title: fileName,
      author: 'Manuscript Editor Pro',
      creator: 'Manuscript Editor Pro'
    });
  }

  doc.save(`${fileName}.pdf`);
}

/**
 * Export as LaTeX with proper document structure
 */
function exportAsLatex(content: string, fileName: string): void {
  let latexContent = `\\documentclass[12pt,a4paper]{article}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{setspace}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{cite}
\\usepackage{hyperref}

% Document settings
\\onehalfspacing

\\begin{document}

`;

  // Process content line by line
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Convert markdown headings to LaTeX sections
    if (trimmedLine.startsWith('#')) {
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const text = trimmedLine.replace(/^#+\s*/, '');
      
      const sectionCommands = [
        '\\section',
        '\\subsection',
        '\\subsubsection',
        '\\paragraph',
        '\\subparagraph'
      ];
      
      const command = sectionCommands[Math.min(level - 1, 4)];
      latexContent += `${command}{${escapeLatex(text)}}\n\n`;
    } else if (trimmedLine) {
      // Regular paragraph
      latexContent += escapeLatex(line) + '\n\n';
    } else {
      latexContent += '\n';
    }
  }

  latexContent += '\\end{document}\n';

  const blob = new Blob([latexContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${fileName}.tex`);
}

/**
 * Convert markdown to HTML (basic conversion)
 */
function convertMarkdownToHtml(content: string): string {
  let html = '';
  const lines = content.split('\n');
  let inParagraph = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Headings
    if (trimmedLine.startsWith('#')) {
      if (inParagraph) {
        html += '</p>\n';
        inParagraph = false;
      }
      
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const text = trimmedLine.replace(/^#+\s*/, '');
      html += `<h${level}>${escapeHtml(text)}</h${level}>\n`;
    } else if (trimmedLine) {
      if (!inParagraph) {
        html += '<p>';
        inParagraph = true;
      }
      html += escapeHtml(line) + ' ';
    } else {
      if (inParagraph) {
        html += '</p>\n';
        inParagraph = false;
      }
    }
  }

  if (inParagraph) {
    html += '</p>\n';
  }

  return html;
}

/**
 * Escape LaTeX special characters
 */
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
