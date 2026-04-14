// Netlify serverless function — proxies quiz answers to Claude API
// This keeps your API key safe on the server (never exposed in the browser)

export default async function handler(req) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured. Please add it in Netlify site settings → Environment variables." }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    const { prompt, system, max_tokens, model } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing prompt in request body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Default to Haiku 4.5 — it's ~3x faster than Sonnet and keeps each call
    // comfortably under Netlify's 26s synchronous function timeout. The client
    // can override with { model: "claude-sonnet-4-5" } per-call if needed.
    const requestBody = {
      model: model || "claude-haiku-4-5-20251001",
      max_tokens: Math.min(max_tokens || 3500, 4096),
      messages: [{ role: "user", content: prompt }],
    };

    // Add system message if provided
    if (system && typeof system === "string") {
      requestBody.system = system;
    }

    console.log("Calling Anthropic API with model:", requestBody.model, "max_tokens:", requestBody.max_tokens, "prompt length:", prompt.length);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({
          error: "AI generation failed",
          details: data,
          message: data?.error?.message || "Unknown API error",
        }),
        { status: response.status, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Function error:", err.message, err.stack);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
