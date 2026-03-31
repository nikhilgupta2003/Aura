import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeUrl: string;
  duration?: string;
}

export async function searchSongs(query: string): Promise<Song[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the song "${query}" and provide a list of 5 matching songs with their artist, a placeholder thumbnail URL (using picsum.photos), and a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...). Return the result as a JSON array of objects with keys: title, artist, thumbnail, youtubeUrl.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    const songs: Song[] = JSON.parse(text);
    return songs.map((s, i) => ({ ...s, id: s.id || `search-${i}-${Date.now()}` }));
  } catch (error) {
    console.error("Error searching songs:", error);
    return [];
  }
}

export async function getGlobalHits(): Promise<Song[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Provide a list of 10 currently popular global hit songs from various countries. For each, include title, artist, a placeholder thumbnail URL (picsum.photos), and a likely YouTube search URL. Return as a JSON array of objects with keys: title, artist, thumbnail, youtubeUrl.",
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    const songs: Song[] = JSON.parse(text);
    return songs.map((s, i) => ({ ...s, id: s.id || `hit-${i}-${Date.now()}` }));
  } catch (error) {
    console.error("Error getting global hits:", error);
    return [];
  }
}

export async function getLyrics(title: string, artist: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide the lyrics for the song "${title}" by "${artist}". If you can't find the exact lyrics, provide a poetic summary or a placeholder message. Return only the lyrics text.`,
      config: {
        systemInstruction: "You are a helpful music assistant. Provide accurate song lyrics when requested.",
      },
    });

    return response.text || "Lyrics not available for this track.";
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return "Failed to load lyrics.";
  }
}
