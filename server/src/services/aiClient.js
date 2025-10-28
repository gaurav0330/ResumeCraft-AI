import axios from "axios";
import logger from "../config/logger.js";
import { config } from "../config/env.js";

const HF_CHAT_API = "https://router.huggingface.co/v1/chat/completions";

export async function generateCompletion(prompt, { maxTokens = 1024, temperature = 0.3 } = {}) {
  const apiKey = config.aiKey;
  if (!apiKey) {
    throw new Error("HF_API_KEY/HUGGING_FACE_API_KEY is not set");
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Chat completion API expects "messages"
  const payload = {
    model: "zai-org/GLM-4.6:novita",
    messages: [
      { role: "user", content: prompt }
    ],
    max_tokens: maxTokens,
    temperature,
  };

  const start = Date.now();
  try {
    const { data } = await axios.post(HF_CHAT_API, payload, { headers, timeout: 90000 });
    const latencyMs = Date.now() - start;
    logger.info(`[AI] Chat model responded in ${latencyMs}ms, tokens=${maxTokens}, temp=${temperature}`);

    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content;
    }
    logger.warn(`[AI] Unexpected response shape: ${JSON.stringify(data).slice(0, 300)}...`);
  } catch (err) {
    const latencyMs = Date.now() - start;
    logger.error(`[AI] Chat model error after ${latencyMs}ms: ${err?.response?.status} ${err?.message}`);
    throw err;
  }

  throw new Error("AI generation failed for chat model");
}
