// D-AUD1 default provider (OWNER_INPUTS.md, CONFIRMED 2026-08-07). Owner-
// run only (CLAUDE.md rule 7) — never exercised by the autonomous routine
// or by tests, which use ./fake.mjs instead.

const API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

export async function synthesize(text, voice, key) {
  if (!key) throw new Error('TTS_API_KEY is empty — set it in .env');
  if (!voice) throw new Error('TTS_VOICE is empty — set it in .env');

  const res = await fetch(`${API_URL}/${encodeURIComponent(voice)}`, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
    }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status} ${res.statusText}: ${await res.text()}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}
