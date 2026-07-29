import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
// It checks local settings first, falls back to env config for local development
export const getGeminiClient = (userApiKey?: string) => {
  const apiKey = userApiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add it in the Settings page.');
  }
  return new GoogleGenAI({ apiKey });
};
