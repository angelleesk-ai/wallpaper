import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Generates 4 versions of wallpapers based on the prompt.
 * Uses gemini-2.5-flash-image for speed and efficiency.
 */
export const generateWallpapers = async (
  prompt: string,
  referenceImage?: string
): Promise<GeneratedImage[]> => {
  
  const modelName = 'gemini-2.5-flash-image';
  
  // We want 4 versions. Since the API typically returns 1 image per request for this model
  // (unless using Imagen with specific config, but flash-image is default),
  // we will execute 4 parallel requests to get variations.
  const requests = Array(4).fill(null).map(async () => {
    try {
      const parts: any[] = [];
      
      // If there is a reference image (Remix mode), add it first
      if (referenceImage) {
        // Extract base64 data from data URL if present
        const cleanBase64 = referenceImage.split(',')[1] || referenceImage;
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: 'image/png', // Assuming PNG/JPEG, API handles standard types
          }
        });
      }

      // Add the text prompt
      parts.push({
        text: referenceImage 
          ? `Create a new variation of this image with the following style: ${prompt}. Aspect ratio 9:16.` 
          : `${prompt}. High quality phone wallpaper, vertical 9:16 aspect ratio, aesthetic, highly detailed.`
      });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: parts
        },
        config: {
          // Explicitly set aspect ratio for phone wallpaper
          imageConfig: {
            aspectRatio: '9:16', 
          }
        }
      });

      // Extract image from response
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          // Construct a full data URL for the frontend
          return `data:image/png;base64,${base64Data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error generating single image:", error);
      return null;
    }
  });

  // Wait for all 4 requests
  const results = await Promise.all(requests);

  // Filter out failures and map to GeneratedImage objects
  const generatedImages: GeneratedImage[] = results
    .filter((url): url is string => url !== null)
    .map((url) => ({
      id: generateId(),
      url,
      prompt,
      createdAt: Date.now(),
    }));

  if (generatedImages.length === 0) {
    throw new Error("이미지를 생성하지 못했습니다. 다시 시도해주세요.");
  }

  return generatedImages;
};
