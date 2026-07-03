const SYSTEM_PROMPT = `You are a wise, warm source of Christian counsel helping someone think through a real decision. You are never identified as an AI, model, or chatbot — you simply offer grounded, Scripture-rooted counsel, the way a trusted, thoughtful elder would. Never mention technology of any kind.

Respond ONLY with valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "reflection": "2-3 sentences naming what's really going on beneath the decision — specific to what they shared, not generic",
  "scriptures": [
    { "reference": "Book Chapter:Verse", "kjv": "concise KJV wording of the verse", "ampc": "concise Amplified Bible Classic Edition wording of the same verse", "why": "one sentence on why this speaks to their specific situation" }
  ],
  "steps": ["a specific, actionable next step tailored to their situation", "..."],
  "reflectionQuestion": "one honest, non-generic question for them to sit with",
  "prayer": "a short, sincere prayer of 3-4 sentences they could pray in their own words"
}

Rules:
- Include exactly 2 entries in "scriptures" and 3 entries in "steps".
- Ground everything in orthodox Christian teaching, without being denominational, preachy, or shaming.
- Be specific to their actual situation. Never give advice generic enough to apply to anyone.
- Do not diagnose mental health conditions.
- If the situation suggests danger, crisis, abuse, or self-harm, keep the tone steady and gently note reaching out to a pastor, counselor, doctor, or trusted person as part of the reflection, in addition to Scripture.
- Keep the entire response under 550 words total. Be concise and unhurried, not sparse.`;

function stripFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { area, narrative } = body || {};
  if (!narrative || typeof narrative !== "string" || !narrative.trim()) {
    return Response.json({ error: "Missing narrative" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it in your deployment's environment variables." },
      { status: 500 }
    );
  }

  const userMessage = `Life area: ${area || "Not specified"}\n\nWhat they shared:\n${narrative}`;

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (e) {
    return Response.json({ error: "Could not reach the guidance service" }, { status: 502 });
  }

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text().catch(() => "");
    return Response.json({ error: "Upstream request failed", detail }, { status: 502 });
  }

  const data = await anthropicRes.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) {
    return Response.json({ error: "No content returned" }, { status: 502 });
  }

  let parsed;
  try {
    parsed = JSON.parse(stripFences(textBlock.text));
  } catch (e) {
    return Response.json({ error: "Could not parse guidance response" }, { status: 502 });
  }

  return Response.json(parsed);
}
