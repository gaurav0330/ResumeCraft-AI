import axios from "axios";

// Hugging Face Inference API client
// Model choice: meta-llama/Meta-Llama-3-8B-Instruct (balanced quality and cost on HF)
// Constraint: must be free and not run locally → use HF hosted inference

const HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

export async function generateCompletion(prompt, { maxTokens = 1024, temperature = 0.3 } = {}) {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error("HF_API_KEY is not set");
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
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

  const { data } = await axios.post(HF_API_URL, payload, { headers, timeout: 60000 });

  // HF returns an array of generated_text objects
  if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
    return data[0].generated_text;
  }

  // Fallback for other provider response shapes
  if (typeof data === "string") return data;
  if (data?.generated_text) return data.generated_text;

  throw new Error("Unexpected response from Hugging Face Inference API");
}


