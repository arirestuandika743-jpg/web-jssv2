/**
 * JSS Security Suite - File Upload Validation & Security Safeguards
 */

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a File object for size, MIME type, and extension.
 */
export function validateUploadedFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan' };
  }

  // 1. Check file size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'Ukuran file melebihi batas maksimal 5 MB' };
  }

  // 2. Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Format file tidak diizinkan. Gunakan JPG, PNG, atau WebP' };
  }

  // 3. Check extension
  const fileNameLower = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_FILE_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  if (!hasValidExtension) {
    return { valid: false, error: 'Ekstensi file tidak valid' };
  }

  return { valid: true };
}

/**
 * Validates Base64 Data URL images (e.g. from FileReader).
 */
export function validateBase64Image(dataUrl: string): FileValidationResult {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return { valid: false, error: 'Data gambar tidak valid' };
  }

  // Check data URL format prefix
  const isImageFormat = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(dataUrl);
  if (!isImageFormat) {
    return { valid: false, error: 'Format gambar base64 tidak valid' };
  }

  // Estimate binary size from Base64 string length
  const base64Length = dataUrl.length - dataUrl.indexOf(',') - 1;
  const estimatedSizeBytes = (base64Length * 3) / 4;

  if (estimatedSizeBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'Ukuran gambar melebihi batas maksimal 5 MB' };
  }

  return { valid: true };
}
