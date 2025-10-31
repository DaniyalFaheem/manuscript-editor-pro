/**
 * Keyboard Shortcuts Service
 * Manages keyboard shortcuts for the editor
 */

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: string;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'b',
    ctrlKey: true,
    description: 'Bold text',
    action: 'bold'
  },
  {
    key: 'i',
    ctrlKey: true,
    description: 'Italic text',
    action: 'italic'
  },
  {
    key: 'g',
    ctrlKey: true,
    description: 'Run grammar check',
    action: 'grammar-check'
  },
  {
    key: 'e',
    ctrlKey: true,
    description: 'Export dialog',
    action: 'export'
  },
  {
    key: 'f',
    ctrlKey: true,
    description: 'Find/Search',
    action: 'search'
  },
  {
    key: 'h',
    ctrlKey: true,
    description: 'Find and Replace',
    action: 'replace'
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save document',
    action: 'save'
  },
  {
    key: 'p',
    ctrlKey: true,
    shiftKey: true,
    description: 'Plagiarism check',
    action: 'plagiarism-check'
  },
  {
    key: 'r',
    ctrlKey: true,
    shiftKey: true,
    description: 'Readability analysis',
    action: 'readability'
  },
  {
    key: 's',
    ctrlKey: true,
    shiftKey: true,
    description: 'Statistics panel',
    action: 'statistics'
  },
  {
    key: 'F11',
    description: 'Toggle presentation mode',
    action: 'presentation-mode'
  },
  {
    key: 'Escape',
    description: 'Exit presentation mode',
    action: 'exit-presentation'
  }
];

export type ShortcutAction = 
  | 'bold'
  | 'italic'
  | 'grammar-check'
  | 'export'
  | 'search'
  | 'replace'
  | 'save'
  | 'plagiarism-check'
  | 'readability'
  | 'statistics'
  | 'presentation-mode'
  | 'exit-presentation';

export type ShortcutHandler = (action: ShortcutAction) => void;

/**
 * Check if a keyboard event matches a shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatch = !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey);
  const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
  const altMatch = !!shortcut.altKey === event.altKey;

  return keyMatch && ctrlMatch && shiftMatch && altMatch;
}

/**
 * Set up keyboard shortcuts
 */
export function setupKeyboardShortcuts(handler: ShortcutHandler): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    for (const shortcut of KEYBOARD_SHORTCUTS) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        handler(shortcut.action as ShortcutAction);
        break;
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) {
    parts.push('Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push('Shift');
  }
  if (shortcut.altKey) {
    parts.push('Alt');
  }
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join('+');
}

/**
 * Get shortcut by action
 */
export function getShortcutByAction(action: ShortcutAction): KeyboardShortcut | undefined {
  return KEYBOARD_SHORTCUTS.find(s => s.action === action);
}
