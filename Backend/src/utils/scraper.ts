// backend/src/utils/scraper.ts
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { YoutubeTranscript } from "youtube-transcript";

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
 * Fetches transcript lines from a YouTube URL and joins them into a single string
 */
export async function extractYoutubeTranscript(url: string): Promise<string> {
  try {
    // Basic regex extraction to get video ID from standard or shortened URLs
    const videoIdMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    );
    if (!videoIdMatch) throw new Error("Invalid YouTube URL format.");

    const videoId = videoIdMatch[1];
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error("No transcript available for this video.");
    }

    return transcriptItems.map((item) => item.text).join(" ");
  } catch (error: any) {
    // Intercept and handle disabled caption exceptions gracefully
    if (
      error.message?.includes("Transcript is disabled") ||
      error.toString().includes("disabled")
    ) {
      throw new Error(
        "🚨 Ingestion Stopped: Captions/Transcripts are disabled on this video by the creator. Please try a video that has subtitles enabled.",
      );
    }

    throw new Error(
      `YouTube transcript extraction failed: ${error.message || error}`,
    );
  }
}
