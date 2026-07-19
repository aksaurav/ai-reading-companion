// Backend/src/routes/ingestRoutes.ts
import { Router, Request, Response } from "express";
import {
  extractArticleText,
  extractYoutubeTranscript,
} from "../utils/scraper.js";
import { generateContentSummary } from "../utils/aiService.js";
import { splitTextIntoChunks } from "../utils/chunker.js";
import { uploadChunksToPinecone } from "../utils/vectorService.js"; // Import Vector service
import Material from "../models/materialModel.js";

const router = Router();

// FIX: Changed "/ingest" to "/" so it doesn't double-nest into /api/ingest/ingest
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: "URL is required" });
      return;
    }

    const existingMaterial = await Material.findOne({ url });
    if (existingMaterial) {
      res.status(200).json({
        success: true,
        message: "This source is already indexed in your companion library!",
        material: existingMaterial,
      });
      return;
    }

    console.log(`📥 Ingestion Pipeline Activated for: ${url}`);

    let extractedText = "";
    let contentType: "YouTube Video" | "Web Article" = "Web Article";
    let contentTitle = "Web Document";

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      contentType = "YouTube Video";
      contentTitle = "YouTube Video Transcript";
      extractedText = await extractYoutubeTranscript(url);
    } else {
      contentType = "Web Article";
      extractedText = await extractArticleText(url);
    }

    console.log(
      `✨ Extraction complete. Requesting summary from OpenRouter...`,
    );
    const summary = await generateContentSummary(contentTitle, extractedText);

    // 1. Save metadata core to MongoDB Atlas
    const newMaterial = await Material.create({
      title: contentTitle,
      url,
      contentType,
      summary,
    });

    console.log(`💾 Saved metadata to MongoDB ID: ${newMaterial._id}`);

    // 2. Fragment full body text into clean structural chunks
    console.log(`✂️ Splitting full text into chunks...`);
    const chunks = splitTextIntoChunks(extractedText, {
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // 3. Generate Embeddings and sync them straight to your live Pinecone Index
    await uploadChunksToPinecone(
      newMaterial._id.toString(),
      chunks,
      contentTitle,
    );
    res.status(200).json({
      success: true,
      message: `Successfully processed, chunked, and indexed ${contentType} vectors into Pinecone!`,
      material: newMaterial,
    });
  } catch (error: any) {
    console.error("Ingestion Pipeline Failure:", error);
    res
      .status(500)
      .json({ error: error.message || "Internal pipeline processing crash." });
  }
});

export default router;
