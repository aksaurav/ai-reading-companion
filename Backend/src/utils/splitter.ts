// backend/src/utils/splitter.ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/**
 * Splits large bodies of text into clean chunks for semantic storage
 */
export async function splitTextChunks(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  return await splitter.splitText(text);
}
