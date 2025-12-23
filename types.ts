
export interface TransformationResult {
  id: string;
  originalImage: string;
  transformedImage: string;
  prompt: string;
  timestamp: number;
}

export type AppStatus = 'idle' | 'uploading' | 'transforming' | 'success' | 'error';
