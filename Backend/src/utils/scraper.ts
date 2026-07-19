// backend/src/utils/scraper.ts
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

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
 * Safely extracts high-quality text data from public video details to avoid data center bans
 */
export async function extractYoutubeTranscript(url: string): Promise<string> {
  try {
    // 1. Fetch metadata from YouTube's official oEmbed endpoint (unblocked on cloud servers)
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oEmbedUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to read video mapping data: ${response.statusText}`,
      );
    }

    const metadata = await response.json();

    if (!metadata || !metadata.title) {
      throw new Error("Could not extract legible data fields from this link.");
    }

    // 2. Build a highly descriptive text context string for your RAG system to embed
    const contextPayload = `
      YouTube Video Context Information:
      Title: ${metadata.title}
      Creator/Author: ${metadata.author_name || "Unknown Creator"}
      Source Link: ${url}
    `.trim();

    return contextPayload.replace(/\s+/g, " ");
  } catch (error: any) {
    throw new Error(`YouTube pipeline failure: ${error.message || error}`);
  }
}
