import apiClient from './api';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

export interface ValidationError {
  valid: false;
  error: string;
}

export interface ValidationSuccess {
  valid: true;
}

/** Validate file before uploading */
export function validateImageFile(file: File): ValidationError | ValidationSuccess {
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return { valid: false, error: `File type not supported. Please use JPG, PNG, or WEBP.` };
  }
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return { valid: false, error: `File is too large (${sizeMB}MB). Maximum size is 5MB.` };
  }
  return { valid: true };
}

/** Get human-readable file size */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Get preview URL for a local File object */
export function getLocalPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export const imageService = {
  /**
   * Upload a single image file to the backend.
   * Returns the URL string on success.
   */
  async upload(file: File, onProgress?: (pct: number) => void): Promise<string> {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);

    // Use XMLHttpRequest for progress tracking
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1';
        xhr.open('POST', `${apiBase}/upload`);

        // Set auth header if token exists
        const token = localStorage.getItem('luxeway_token') ||
          (() => {
            try {
              const stored = JSON.parse(localStorage.getItem('luxeway_auth') || '{}');
              return stored?.state?.token;
            } catch { return null; }
          })();
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url || '');
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
    }

    // Fallback without progress
    const response = await apiClient.post<any>('/upload', formData);
    if (!response?.url) throw new Error('Upload failed: no URL returned');
    return response.url;
  },

  /**
   * Upload multiple images and return all URLs.
   */
  async uploadMultiple(files: File[], onProgress?: (index: number, pct: number) => void): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await this.upload(files[i], onProgress ? (pct) => onProgress(i, pct) : undefined);
      urls.push(url);
    }
    return urls;
  },
};

export default imageService;
