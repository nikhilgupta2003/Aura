import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail: string;
  youtubeUrl: string;
  duration?: string;
}

export async function searchSongs(query: string): Promise<Song[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the song "${query}" and provide a list of 5 matching songs with their artist, album name, a placeholder thumbnail URL (using picsum.photos), and a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...). Return the result as a JSON array of objects with keys: title, artist, album, thumbnail, youtubeUrl.`,
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
      contents: "Provide a list of 10 currently popular global hit songs from various countries. For each, include title, artist, album name, a placeholder thumbnail URL (picsum.photos), and a likely YouTube search URL. Return as a JSON array of objects with keys: title, artist, album, thumbnail, youtubeUrl.",
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

export async function getIndianHits(): Promise<Song[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Provide a list of 10 currently popular Indian hit songs (Bollywood, Indie, etc.). For each, include title, artist, album name, a placeholder thumbnail URL (picsum.photos), and a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...). Return as a JSON array of objects with keys: title, artist, album, thumbnail, youtubeUrl.",
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    const songs: Song[] = JSON.parse(text);
    return songs.map((s, i) => ({ ...s, id: s.id || `indian-${i}-${Date.now()}` }));
  } catch (error) {
    console.error("Error getting Indian hits:", error);
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

export async function getArtistDetails(artistName: string): Promise<{ name: string; bio: string; topSongs: Song[]; image: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide details for the artist "${artistName}". Include a short bio, a list of 5 top songs with their title, thumbnail (picsum.photos), and valid YouTube URL. Also provide a high-quality artist image URL (picsum.photos). Return as a JSON object with keys: name, bio, topSongs (array of Song objects), image.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      topSongs: (data.topSongs || []).map((s: any, i: number) => ({ ...s, id: `artist-song-${i}-${Date.now()}` }))
    };
  } catch (error) {
    console.error("Error getting artist details:", error);
    return { name: artistName, bio: "Bio not available.", topSongs: [], image: "https://picsum.photos/seed/artist/800/800" };
  }
}

export async function getAlbumDetails(albumName: string, artistName: string): Promise<{ title: string; artist: string; songs: Song[]; cover: string; year: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide details for the album "${albumName}" by "${artistName}". Include the release year, a list of all songs in the album with their title, thumbnail (picsum.photos), and valid YouTube URL. Also provide a high-quality album cover URL (picsum.photos). Return as a JSON object with keys: title, artist, songs (array of Song objects), cover, year.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      songs: (data.songs || []).map((s: any, i: number) => ({ ...s, id: `album-song-${i}-${Date.now()}` }))
    };
  } catch (error) {
    console.error("Error getting album details:", error);
    return { title: albumName, artist: artistName, songs: [], cover: "https://picsum.photos/seed/album/800/800", year: "Unknown" };
  }
}
