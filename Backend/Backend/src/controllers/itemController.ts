// backend/src/controllers/itemController.ts
import { Request, Response } from "express";
import Item from "../models/Item.js";
import {
  extractArticleText,
  extractYoutubeTranscript,
} from "../utils/scraper.js";
import { generateLLMSummary } from "../config/openrouter.js";

export const createItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, type, url, status, rawContent } = req.body;

    if (!title || !type) {
      res.status(400).json({ error: "Title and type are required fields." });
      return;
    }

    let extractedText = "";

    if (type === "article") {
      if (!url) {
        res.status(400).json({ error: "URL is required for articles." });
        return;
      }
      extractedText = await extractArticleText(url);
    } else if (type === "video") {
      if (!url) {
        res.status(400).json({ error: "URL is required for videos." });
        return;
      }
      extractedText = await extractYoutubeTranscript(url);
    } else if (type === "book") {
      if (!rawContent) {
        res
          .status(400)
          .json({
            error: "Content/Notes are required for a manual book entry.",
          });
        return;
      }
      extractedText = rawContent;
    } else {
      res
        .status(400)
        .json({
          error: "Invalid content type. Must be article, video, or book.",
        });
      return;
    }

    // Await the asynchronous summary generator safely
    const aiSummary = await generateLLMSummary(extractedText);

    const newItem = new Item({
      title,
      type,
      url,
      status: status || "to-read",
      rawContent: extractedText,
      summary: aiSummary,
      isEmbedded: false,
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      message: "Item added and summarized successfully!",
      item: savedItem,
    });
  } catch (error: any) {
    console.error("Ingestion processing failure:", error);
    res
      .status(500)
      .json({ error: error.message || "Internal server ingestion failure." });
  }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
