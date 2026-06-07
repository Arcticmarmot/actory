type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

const stripMarkdownFence = (content: string) => {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/^```(?:yaml|yml)?\s*([\s\S]*?)\s*```$/i);

  return fenceMatch ? fenceMatch[1].trim() : trimmed;
};

const buildChatCompletionsUrl = (baseUrl: string) => {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    throw new Error("LLM_BASE_URL is required.");
  }

  if (normalizedBaseUrl.endsWith("/chat/completions")) {
    return normalizedBaseUrl;
  }

  const parsedUrl = new URL(normalizedBaseUrl);

  if (
    parsedUrl.hostname.endsWith("qnaigc.com") &&
    (parsedUrl.pathname === "" || parsedUrl.pathname === "/")
  ) {
    return `${parsedUrl.origin}/v1/chat/completions`;
  }

  return `${normalizedBaseUrl}/chat/completions`;
};

export async function callLLM(prompt: string) {
  const apiKey = process.env.LLM_API_KEY?.trim();
  const baseUrl = process.env.LLM_BASE_URL?.trim();
  const model = process.env.LLM_MODEL?.trim();

  if (!apiKey) {
    throw new Error("LLM_API_KEY is required.");
  }

  if (!baseUrl) {
    throw new Error("LLM_BASE_URL is required.");
  }

  if (!model) {
    throw new Error("LLM_MODEL is required.");
  }

  const response = await fetch(buildChatCompletionsUrl(baseUrl), {
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are Actory's screenplay conversion engine. Return only valid YAML that follows the user's schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 4096,
      model,
      stream: false,
      temperature: 0.2,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("LLM response did not include message content.");
  }

  return stripMarkdownFence(content);
}
