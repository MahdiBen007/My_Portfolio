const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'text/plain',
]);

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export type UploadCategory = 'image' | 'document' | 'any';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  category: UploadCategory = 'image'
): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (category === 'image' && !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG`,
    };
  }

  if (category === 'document') {
    if (!ALLOWED_IMAGE_TYPES.has(file.type) && !ALLOWED_DOCUMENT_TYPES.has(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG, PDF, TXT`,
      };
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'exe' || ext === 'bat' || ext === 'cmd' || ext === 'sh' || ext === 'ps1' || ext === 'msi') {
    return { valid: false, error: 'Executable files are not allowed' };
  }

  return { valid: true };
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255);
}
