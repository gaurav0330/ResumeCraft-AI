import axios from "axios";
import logger from "../config/logger.js";
import { config } from "../config/env.js";

// Hugging Face Inference API client
// Model choice: meta-llama/Meta-Llama-3-8B-Instruct (balanced quality and cost on HF)
// Constraint: must be free and not run locally → use HF hosted inference

// Use non-gated, free models to avoid 403 access errors
// Primary: Zephyr 7B (instruction tuned)
const PRIMARY_MODEL_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";
// Fallback: FLAN-T5 Large (cost-effective and general)
const FALLBACK_MODEL_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large";

export async function generateCompletion(prompt, { maxTokens = 1024, temperature = 0.3 } = {}) {
  const apiKey = config.aiKey;
  if (!apiKey) {
    throw new Error("HF_API_KEY/HUGGING_FACE_API_KEY is not set");
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Wait-For-Model": "true", // ensure cold models are loaded before response
  };

  // Text-generation inference payload
  const payload = {
    inputs: prompt,
    parameters: {
      max_new_tokens: maxTokens,
      temperature,
      return_full_text: false,
    },
  };

  const start = Date.now();
  try {
    const { data } = await axios.post(PRIMARY_MODEL_URL, payload, { headers, timeout: 90000 });
    const latencyMs = Date.now() - start;
    logger.info(`[AI] Primary model responded in ${latencyMs}ms, tokens=${maxTokens}, temp=${temperature}`);

    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      return data[0].generated_text;
    }
    if (typeof data === "string") return data;
    if (data?.generated_text) return data.generated_text;
    logger.warn(`[AI] Unexpected primary response shape: ${JSON.stringify(data).slice(0, 300)}...`);
  } catch (err) {
    const latencyMs = Date.now() - start;
    logger.error(`[AI] Primary model error after ${latencyMs}ms: ${err?.response?.status} ${err?.message}`);
  }

  // Fallback model attempt
  try {
    const { data } = await axios.post(FALLBACK_MODEL_URL, payload, { headers, timeout: 90000 });
    logger.info(`[AI] Fallback model used successfully`);
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      return data[0].generated_text;
    }
    if (typeof data === "string") return data;
    if (data?.generated_text) return data.generated_text;
  } catch (err) {
    logger.error(`[AI] Fallback model error: ${err?.response?.status} ${err?.message}`);
  }

  throw new Error("AI generation failed for both primary and fallback models");
}


