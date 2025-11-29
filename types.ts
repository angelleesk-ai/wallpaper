export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  createdAt: number;
}

export interface GenerationConfig {
  prompt: string;
  referenceImage?: string; // Base64 string for remixing
}

export type AspectRatio = '9:16' | '16:9' | '1:1';
