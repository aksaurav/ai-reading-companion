// Backend/src/routes/chatRoutes.ts
import { Router, Request, Response } from "express";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const indexName = process.env.PINECONE_INDEX || "ai-reading-companion";

// FIX: Changed "/query" to "/" so it resolves directly to /api/query
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: "Question is required" });
      return;
    }

    console.log(`🔍 Received User Query: "${question}"`);
    const index = pc.index(indexName);

    // 1. Convert the user query into a vector embedding using the same model
    console.log("🧠 Vectorizing user question...");
    const embeddingResponse = await pc.inference.embed({
      model: "multilingual-e5-large",
      inputs: [question],
      parameters: {
        inputType: "query", // Optimized specifically for search queries
      },
    });

    // FIX: Typecast the response element to 'any' to cleanly bypass internal SDK union conflicts
    const embeddingRecord = embeddingResponse.data[0] as any;
    const queryVector = embeddingRecord?.values;

    if (!queryVector) {
      throw new Error("Failed to generate embedding vector for query.");
    }

    // 2. Query Pinecone for top matches
    console.log("🚀 Querying Pinecone for relevant context...");
    const searchResults = await index.query({
      vector: queryVector,
      topK: 4, // Retrieve the top 4 most relevant text fragments
      includeMetadata: true,
    });

    // 3. Assemble the matched context strings
    const contextFragments = searchResults.matches
      .map((match: any) => match.metadata?.text || "")
      .filter((text: string) => text.length > 0);

    if (contextFragments.length === 0) {
      res.status(200).json({
        answer:
          "I couldn't find any relevant text in your knowledge base to answer this question. Try ingesting more sources first!",
        sources: [],
      });
      return;
    }

    const contextPayload = contextFragments.join("\n\n---\n\n");
    const uniqueTitles = Array.from(
      new Set(
        searchResults.matches.map(
          (match: any) => match.metadata?.title || "Unknown Source",
        ),
      ),
    );

    // 4. Send Context + Question to Groq
    console.log("⚡ Generating expert answer via Groq...");
    const groqApiKey = process.env.GROQ_API_KEY;
    const model = process.env.AI_MODEL || "llama-3.1-8b-instant";

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content:
                "You are a brilliant reading companion assistant. Use ONLY the provided context blocks to answer the user's question accurately. If the answer cannot be found in the context, state that you do not have that information.",
            },
            {
              role: "user",
              content: `Context:\n${contextPayload}\n\nQuestion: ${question}`,
            },
          ],
          temperature: 0.4,
        }),
      },
    );

    if (!groqResponse.ok) {
      throw new Error(`Groq API returned status ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const answer = groqData.choices[0].message.content.trim();

    res.status(200).json({
      success: true,
      answer,
      sources: uniqueTitles,
    });
  } catch (error: any) {
    console.error("Query Route Error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to process query." });
  }
});

export default router;
