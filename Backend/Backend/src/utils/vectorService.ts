// Backend/src/utils/vectorService.ts
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

// Initialize the official Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

// Target your index name directly from your environment handles
const indexName = process.env.PINECONE_INDEX || "ai-reading-companion";

/**
 * Generates vector embeddings for text chunks and stores them directly into your Pinecone Index
 */
export async function uploadChunksToPinecone(
  materialId: string,
  chunks: string[],
  title: string,
) {
  try {
    const index = pc.index(indexName);

    console.log(
      `🧠 Generating embeddings for ${chunks.length} chunks via Pinecone Inference...`,
    );

    // Using Pinecone's universal, free-tier serverless embedding model
    const embeddingModel = "multilingual-e5-large";

    // Pass configuration details inside a unified payload object structure
    const embeddings = await pc.inference.embed({
      model: embeddingModel,
      inputs: chunks,
      parameters: {
        inputType: "passage",
        truncate: "END",
      },
    });

    // Format individual chunks into standard records Pinecone expects
    const records = chunks.map((chunk, index) => {
      // Type assertion to bypass structural union conflicts on type 'Embedding'
      const embedding = embeddings.data[index] as any;

      return {
        id: `${materialId}-chunk-${index}`,
        values: embedding?.values || [],
        metadata: {
          materialId: materialId.toString(),
          title: title,
          text: chunk, // Storing raw fragment text allows us to build the context prompt during queries
        },
      };
    });

    console.log(`🚀 Upserting vectors into Pinecone index: "${indexName}"...`);

    // Upload records enclosed inside a top-level data property wrapper object
    await index.upsert({ records });

    console.log(`✅ Vector synchronization complete!`);
  } catch (error: any) {
    console.error("Pinecone Vector Processing Error:", error);
    throw new Error(`Pinecone Vector storage failed: ${error.message}`);
  }
}
