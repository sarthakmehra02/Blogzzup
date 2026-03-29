// src/utils/whisperTranscribe.js
// Named export: transcribeAudio

/**
 * Transcribes audio using OpenAI Whisper API.
 * @param {Blob} audioBlob - Audio blob (audio/webm or audio/wav)
 * @returns {Promise<string>} - Transcript string
 * @throws {Error} - On network or API error
 */
export async function transcribeAudio(audioBlob) {
  const MOCK_MODE = import.meta.env.VITE_MOCK_WHISPER === "true";
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1500));
    return "The importance of reading books extends far beyond mere entertainment, serving as a fundamental pillar for personal growth and intellectual development. When individuals engage with literature, they are not only absorbing information but also enhancing their cognitive abilities, improving focus, and expanding their vocabulary. Regular reading fosters empathy by allowing readers to experience diverse perspectives and worlds, ultimately strengthening emotional intelligence. Furthermore, in an age dominated by short-form digital content, books offer a necessary escape that reduces stress and promotes mental relaxation. By cultivating a reading habit, individuals unlock the potential for lifelong learning and intellectual enrichment.";
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY is not set in .env");

  if (!(audioBlob instanceof Blob)) {
    throw new Error('Input must be a Blob (audio/webm or audio/wav)');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'gpt-4o-mini');

  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: formData
    });

    if (response.status === 429) {
      if (attempt === 3) {
        throw new Error("Service is busy — please wait 10 seconds and try again.");
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }

    break;
  }

  if (!response.ok) {
    let errorMsg = `Whisper API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error && errorData.error.message) {
        errorMsg += ` - ${errorData.error.message}`;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (!data.text) {
    throw new Error('No transcript returned from Whisper API');
  }
  return data.text;
}

/**
 * Extracts blog context (keyword, tone, summary) from a transcript using Anthropic Claude API.
 * @param {string} transcript - Raw transcript string
 * @returns {Promise<{ suggestedKeyword: string, suggestedTone: string, summary: string }|null>}
 */
export async function extractBlogContext(transcript) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("VITE_ANTHROPIC_API_KEY is not set in .env");
  if (typeof transcript !== 'string' || !transcript.trim()) return null;

  const systemPrompt =
    "You are an SEO assistant. Given a raw voice transcript, extract:\n" +
    "1. The single best target keyword (5 words max)\n" +
    "2. The writing tone (one of: Professional, Conversational, Authoritative, Educational)\n" +
    "3. A 1-sentence summary of the topic\n" +
    "Respond ONLY in JSON: { suggestedKeyword, suggestedTone, summary }";

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      { role: "user", content: transcript }
    ]
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) return null;
    const data = await response.json();
    // Claude's response is usually in data.content[0].text
    let jsonText = data?.content?.[0]?.text || "";
    // Remove code block markers if present
    jsonText = jsonText.replace(/^```json|```$/g, '').trim();
    try {
      return JSON.parse(jsonText);
    } catch (_) {
      return null;
    }
  } catch (_) {
    return null;
  }
}
