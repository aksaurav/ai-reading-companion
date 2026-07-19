// Backend/src/utils/aiService.ts
import dotenv from "dotenv";
dotenv.config();

export async function generateContentSummary(
  title: string,
  fullText: string,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.AI_MODEL || "llama-3.1-8b-instant";

  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY in backend environment configuration.",
    );
  }

  // Safe excerpt trimming to avoid hitting token per-minute rate thresholds
  const excerpt = fullText.slice(0, 5000);

  try {
    // We send requests directly to Groq's OpenAI-compatible router layer
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content:
                "You are a brilliant reading assistant. Provide a highly concise, executive summary (maximum 3 sentences) highlighting the core structural takeaways of the text.",
            },
            {
              role: "user",
              content: `Source Title: ${title}\n\nContent Excerpt:\n${excerpt}`,
            },
          ],
          temperature: 0.3, // Kept low for consistent, non-creative summarizations
        }),
      },
    );

    if (!response.ok) {
      const errorDetail = await response.json().catch(() => ({}));
      throw new Error(
        errorDetail?.error?.message ||
          `Groq API Error Status: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error("Groq AI Service processing breakdown:", error);
    throw new Error(`AI Core summary extraction failure: ${error.message}`);
  }
}
