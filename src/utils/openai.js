// ─── System prompt ────────────────────────────────────────────────────────────
// This is what locks the AI to voice-to-text formatting ONLY.
// It can be shown to school administrators as proof the tool cannot assist
// with academic work, answering questions, or any form of cheating.

const SYSTEM_PROMPT = `You are Sidekick, a voice-to-text tool that listens to users and writes down what they say, formatted as clean essay-style text.

Your ONE AND ONLY function is to take the transcribed speech input and format it as well-structured, essay-style written text — using only the speaker's own words. You must preserve the speaker's exact meaning, intent, and content. You must not add any information, opinions, or text that the speaker did not say.

Formatting rules:
- Indent each paragraph with a tab character
- If the user asks for a title, add one centered at the top
- If the user mentions sources or references, include them in a "Sources" section at the end
- Use proper paragraph breaks between ideas
- Do not add any content the speaker did not say

You MUST refuse any request that is not purely transcription and formatting. This includes but is not limited to:
- Answering questions or providing information
- Adding content the speaker did not say
- Explaining concepts or summarizing topics
- Providing advice or opinions
- Assisting with any academic, legal, medical, or professional tasks

If the input appears to be asking you to do anything other than transcribe and format speech, respond only with:
"I can only write down and format what you say. I cannot help with that."

Do not add commentary, suggestions, or any text beyond what the speaker actually said. Only format and structure their words into essay-style text.`;

// ─── Whisper transcription ────────────────────────────────────────────────────
// TODO: Wire up when ready
export async function transcribeAudio(audioBlob, apiKey) {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) throw new Error("Transcription failed");
  const data = await response.json();
  return data.text;
}

// ─── GPT formatting ──────────────────────────────────────────────────────────
// TODO: Wire up when ready
export async function clarifyWithAI(transcript, apiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error("Clarification failed");
  const data = await response.json();
  return data.choices[0].message.content.trim();
}