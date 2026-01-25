
export interface ProcessingState {
  isProcessing: boolean;
  status: 'idle' | 'uploading' | 'analyzing' | 'enhancing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
}

export interface ImageResult {
  originalUrl: string;
  enhancedUrl?: string;
}

export enum StorageKeys {
  API_KEY = 'score_magic_fix_api_key'
}
