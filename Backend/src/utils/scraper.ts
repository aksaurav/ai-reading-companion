// backend/src/utils/scraper.ts
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { AssemblyAI } from "assemblyai";
import ytdl from "ytdl-core";

// Initialize AssemblyAI with your API key
// Make sure to add ASSEMBLYAI_API_KEY to your Render Environment Variables
const aaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

/**
 * Extracts main text body from an article URL using Mozilla Readability
 */
export async function extractArticleText(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch article: ${response.statusText}`);

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      throw new Error("Could not parse clean text from this article.");
    }

    return article.textContent.replace(/\s+/g, " ").trim();
  } catch (error: any) {
    throw new Error(`Article extraction failed: ${error.message}`);
  }
}

/**
 * Streams the audio of a YouTube video directly into AssemblyAI's speech-to-text pipeline
 */
export async function extractYoutubeTranscript(url: string): Promise<string> {
  try {
    // Validate the YouTube URL format
    if (!ytdl.validateURL(url)) {
      throw new Error("Invalid YouTube URL format.");
    }

    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new Error("Missing ASSEMBLYAI_API_KEY in environment variables.");
    }

    // 1. Get audio-only stream from the YouTube video to minimize bandwidth
    const audioStream = ytdl(url, {
      quality: "lowestaudio",
      filter: "audioonly",
    });

    // 2. Transcribe the audio stream directly using AssemblyAI
    const transcript = await aaiClient.transcripts.transcribe({
      audio: audioStream,
    });

    if (transcript.status === "error") {
      throw new Error(`Transcription service failed: ${transcript.error}`);
    }

    if (!transcript.text) {
      throw new Error(
        "No readable spoken content could be extracted from this audio.",
      );
    }

    // Return the high-accuracy transcript text
    return transcript.text.replace(/\s+/g, " ").trim();
  } catch (error: any) {
    throw new Error(`YouTube pipeline failure: ${error.message || error}`);
  }
}
