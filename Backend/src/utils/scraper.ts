// backend/src/utils/scraper.ts
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { getSubtitles } from "youtube-caption-extractor"; // Swapped to the stable endpoint

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

    // Fetch subtitles dynamically (defaults to English 'en')
    const transcriptItems = await getSubtitles({
      videoID: videoId,
      lang: "en",
    });

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error("No transcript lines were returned for this video.");
    }

    // Clean up typical transcript HTML artifacts like &nbsp; and format spaces smoothly
    return transcriptItems
      .map((item) => item.text)
      .join(" ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch (error: any) {
    // Stop assuming every error is a "disabled captions" error so you get accurate logs
    throw new Error(`YouTube pipeline failure: ${error.message || error}`);
  }
}
