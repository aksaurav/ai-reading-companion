// backend/src/config/openrouter.ts
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Define the interface matching OpenRouter's payload structure
interface OpenRouterResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/**
 * Sends text snippets to OpenRouter to generate concise reading summaries
 */
export async function generateLLMSummary(text: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY in environment variables.");
  }

  // Cap the text to prevent token limits on large inputs
  const cleanSnippet = text.slice(0, 8000);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash", // Fast, highly descriptive summary engine
          messages: [
            {
              role: "system",
              content:
                "You are an elite research assistant. Provide a concise, highly structured summary of the text provided. Use bullet points for key takeaways, keep it actionable, and limit it to 3 paragraphs maximum.",
            },
            {
              role: "user",
              content: `Please summarize the following material:\n\n${cleanSnippet}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.statusText} ${JSON.stringify(errData)}`,
      );
    }

    // Cast the unknown payload to our explicit structure
    const data = (await response.json()) as OpenRouterResponse;
    return (
      data.choices?.[0]?.message?.content ||
      "Summary generation returned empty results."
    );
  } catch (error: any) {
    console.error("Error generating summary:", error.message);
    return "Automatic summary generation failed, but content was successfully saved.";
  }
}
