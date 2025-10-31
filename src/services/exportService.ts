import { saveAs } from 'file-saver';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import type { ExportFormat } from '../types';

/**
 * Export text in the specified format
 */
export async function exportFile(
  content: string,
  fileName: string,
  format: ExportFormat
): Promise<void> {
  const baseFileName = fileName.replace(/\.[^/.]+$/, '');

  switch (format) {
    case 'txt':
      exportAsText(content, baseFileName);
      break;
    
    case 'md':
      exportAsMarkdown(content, baseFileName);
      break;
    
    case 'html':
      exportAsHtml(content, baseFileName);
      break;
    
    case 'docx':
      await exportAsDocx(content, baseFileName);
      break;
    
    case 'pdf':
      // PDF export requires additional libraries or browser print
      // For now, we'll create an HTML version that can be printed to PDF
      exportAsPrintableHtml(content, baseFileName);
      break;
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
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
 * Export as HTML
 */
function exportAsHtml(content: string, fileName: string): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    p {
      margin-bottom: 1em;
    }
  </style>
</head>
<body>
  <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(content)}</pre>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${fileName}.html`);
}

/**
 * Export as DOCX using docx library
 */
async function exportAsDocx(content: string, fileName: string): Promise<void> {
  const paragraphs = content.split('\n').map(
    line => new Paragraph({
      children: [new TextRun(line || ' ')],
      spacing: {
        after: 200,
      },
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

/**
 * Export as printable HTML (for PDF printing)
 */
function exportAsPrintableHtml(content: string, fileName: string): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    @media print {
      body { margin: 0; }
    }
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    p {
      margin-bottom: 1em;
    }
  </style>
</head>
<body>
  <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(content)}</pre>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    };
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
