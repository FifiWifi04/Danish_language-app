// Test-only provider (PLAN_PHASE4_AUDIO.md WS-A). The routine NEVER uses
// a real key; this is what tests and any dry-run exercise instead.

export async function synthesize(_text, _voice, _key) {
  return new Uint8Array([0]);
}
