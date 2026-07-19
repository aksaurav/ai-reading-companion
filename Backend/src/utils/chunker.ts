// Backend/src/utils/chunker.ts

interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Splits a massive string into smaller chunks with an overlap threshold
 * to preserve cross-boundary context for vector searches.
 */
export function splitTextIntoChunks(
  text: string,
  options: ChunkOptions = {},
): string[] {
  const chunkSize = options.chunkSize || 1000; // Targeted characters per chunk
  const chunkOverlap = options.chunkOverlap || 200; // Characters preserved from the previous chunk

  if (!text || text.length === 0) return [];
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    // Determine end coordinate
    let endIndex = startIndex + chunkSize;

    // If we aren't at the end of the text string, try to break at a clean space
    if (endIndex < text.length) {
      const lastSpace = text.lastIndexOf(" ", endIndex);
      if (lastSpace > startIndex) {
        endIndex = lastSpace; // Clean break at a word boundary
      }
    }

    // Extract the substring fragment
    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    // Advance index with step overlap factored in
    startIndex = endIndex - chunkOverlap;
  }

  return chunks;
}
