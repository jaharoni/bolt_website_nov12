import { supabase } from './supabase';

export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'fullscreen' | 'original';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp';
  resize?: 'cover' | 'contain' | 'fill';
}

const SIZE_PRESETS: Record<ImageSize, ImageTransformOptions> = {
  thumbnail: {
    width: 400,
    height: 400,
    quality: 75,
    resize: 'cover'
  },
  small: {
    width: 800,
    quality: 80,
    resize: 'contain'
  },
  medium: {
    width: 1200,
    quality: 85,
    resize: 'contain'
  },
  large: {
    width: 1920,
    quality: 85,
    resize: 'contain'
  },
  fullscreen: {
    width: 2560,
    quality: 90,
    resize: 'contain'
  },
  original: {}
};

export interface OptimizedImageUrls {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  fullscreen: string;
  original: string;
}

export class ImageService {
  static getOptimizedUrl(
    bucket: string,
    path: string,
    size: ImageSize = 'medium',
    customOptions?: ImageTransformOptions
  ): string {
    if (!bucket || !path) {
      console.warn('[ImageService] Missing bucket or path:', { bucket, path });
      return '';
    }

    const options = customOptions || SIZE_PRESETS[size];

    if (Object.keys(options).length === 0) {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      return data.publicUrl;
    }

    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path, {
          transform: options
        });

      return data.publicUrl;
    } catch (error) {
      console.warn('[ImageService] Transform failed, falling back to public URL:', error);
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      return data.publicUrl;
    }
  }

  static getAllOptimizedUrls(bucket: string, path: string): OptimizedImageUrls {
    return {
      thumbnail: this.getOptimizedUrl(bucket, path, 'thumbnail'),
      small: this.getOptimizedUrl(bucket, path, 'small'),
      medium: this.getOptimizedUrl(bucket, path, 'medium'),
      large: this.getOptimizedUrl(bucket, path, 'large'),
      fullscreen: this.getOptimizedUrl(bucket, path, 'fullscreen'),
      original: this.getOptimizedUrl(bucket, path, 'original')
    };
  }

  static getResponsiveSrcSet(bucket: string, path: string): string {
    const small = this.getOptimizedUrl(bucket, path, 'small');
    const medium = this.getOptimizedUrl(bucket, path, 'medium');
    const large = this.getOptimizedUrl(bucket, path, 'large');

    return `${small} 800w, ${medium} 1200w, ${large} 1920w`;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  static validateFileSize(file: File, maxSizeMB: number = 100): { valid: boolean; message?: string } {
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxBytes) {
      return {
        valid: false,
        message: `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }

  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  static isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  static getSupportedFormats(): string[] {
    return [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ];
  }

  static isFormatSupported(file: File): boolean {
    return this.getSupportedFormats().includes(file.type);
  }
}

export default ImageService;
