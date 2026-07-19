// backend/src/controllers/aiController.ts
import { Request, Response } from "express";
import { Pinecone } from "@pinecone-database/pinecone";
import Item from "../models/Item.js";
import { splitTextChunks } from "../utils/splitter.js";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const indexName = process.env.PINECONE_INDEX || "reading-companion";

// Helper interface for handling OpenRouter chat payloads safely
interface OpenRouterResponse {
  choices: Array<{ message?: { content?: string } }>;
}

// Helper interface for standard API vector responses
interface OpenRouterEmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}

/**
 * Helper to generate raw vector embeddings using OpenRouter (OpenAI standard embedding formats)
 */
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small", // High performance 1536-dim standard embedding
      input: text,
    }),
  });

  if (!response.ok) throw new Error("Failed to generate embedding vector.");
  const data = (await response.json()) as OpenRouterEmbeddingResponse;
  return data.data[0].embedding;
}

/**
 * 1. Process and ingest saved document text splits into Pinecone using Batch Upserting
 */
export const embedItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;

    // Type Guard: Strict check to guarantee itemId is a single string
    if (typeof itemId !== "string") {
      res.status(400).json({ error: "Invalid item ID format." });
      return;
    }

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({ error: "Item not found." });
      return;
    }

    if (item.isEmbedded) {
      res.status(200).json({ message: "Item already vectorized." });
      return;
    }

    const chunks = await splitTextChunks(item.rawContent);
    const index = pc.index(indexName);

    const recordsToUpsert = [];

    // Collect all embeddings and construct records
    for (let i = 0; i < chunks.length; i++) {
      const vector = await getEmbedding(chunks[i]);
      recordsToUpsert.push({
        id: `${itemId}_chunk_${i}`,
        values: vector,
        metadata: { text: chunks[i] },
      });
    }

    // Upsert everything efficiently in one single API request batch
    if (recordsToUpsert.length > 0) {
      await index.namespace(itemId).upsert({
        records: recordsToUpsert,
      });
    }

    item.isEmbedded = true;
    await item.save();

    res
      .status(200)
      .json({
        message: "Content successfully vectorized and indexed into Pinecone.",
      });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 2. Discuss Mode: Grounded RAG Querying over an isolated item namespace
 */
export const discussItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { question } = req.body;

    // Type Guard: Ensure itemId is a single string
    if (typeof itemId !== "string") {
      res.status(400).json({ error: "Invalid item ID format." });
      return;
    }

    if (!question) {
      res.status(400).json({ error: "Question text is required." });
      return;
    }

    const queryVector = await getEmbedding(question);
    const index = pc.index(indexName);

    // Query exclusively within the matching namespace boundary
    const queryResponse = await index.namespace(itemId).query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    const context =
      queryResponse.matches
        ?.map((match) => (match.metadata as any)?.text || "")
        .join("\n\n") || "No context found.";

    // Generate response using OpenRouter
    const chatResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an interactive learning companion. Answer the question using ONLY the provided context material. If the answer cannot be found in the context, state that explicitly.\n\n[CONTEXT]\n${context}`,
            },
            { role: "user", content: question },
          ],
        }),
      },
    );

    const data = (await chatResponse.json()) as OpenRouterResponse;
    res
      .status(200)
      .json({
        answer: data.choices?.[0]?.message?.content || "No answer generated.",
      });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 3. Quiz Me Mode: Synthesize evaluation questions out of raw data matching an Item
 */
export const generateQuiz = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { itemId } = req.params;

    // Type Guard: Ensure itemId is a single string
    if (typeof itemId !== "string") {
      res.status(400).json({ error: "Invalid item ID format." });
      return;
    }

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({ error: "Item target not found." });
      return;
    }

    const quizResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                'You are an instructor. Generate 3 multiple choice comprehension questions based on the following text content. Return your response inside a structured JSON array format containing objects with "question", "options" (array of 4 strings), and "correctAnswer" keys.',
            },
            { role: "user", content: item.rawContent.slice(0, 10000) },
          ],
          response_format: { type: "json_object" }, // <-- Fixed: Wrapped "type" in quotes
        }),
      },
    );

    const data = (await quizResponse.json()) as OpenRouterResponse;
    const rawQuizText = data.choices?.[0]?.message?.content || "[]";

    res.status(200).json(JSON.parse(rawQuizText));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
