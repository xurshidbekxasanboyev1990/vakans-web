import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * @param dirty - The potentially dangerous string to sanitize
 * @returns Sanitized string safe for rendering
 */
export function sanitizeInput(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Remove all HTML tags
    ALLOWED_ATTR: [], // Remove all attributes
    KEEP_CONTENT: true, // Keep text content
  });
}

/**
 * Sanitize HTML content while allowing safe tags
 * @param dirty - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize rich text editor content
 * @param dirty - The rich text to sanitize
 * @returns Sanitized rich text
 */
export function sanitizeRichText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'b', 'i', 'u', 'em', 'strong',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Create a sanitized props object for React components
 * @param obj - Object with potentially dangerous values
 * @returns Object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}
