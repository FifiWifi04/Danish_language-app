import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('audio', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('audio: clipFor resolves the manifest entry when present, undefined on a miss', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ et: { filename: 'et.mp3', voice: 'v', provider: 'p', generatedAt: 't0' } }),
      }),
    );
    const { clipFor } = await import('../src/ui/audio');
    expect(await clipFor('et')).toEqual({ filename: 'et.mp3', voice: 'v', provider: 'p', generatedAt: 't0' });
    expect(await clipFor('missing')).toBeUndefined();
  });

  it('audio: a fetch failure degrades to an empty manifest, not a throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const { clipFor } = await import('../src/ui/audio');
    await expect(clipFor('et')).resolves.toBeUndefined();
  });

  it('audio: playFor resolves false silently on a manifest miss, no speechSynthesis fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play');
    const { playFor } = await import('../src/ui/audio');
    expect(await playFor('nothing')).toBe(false);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('audio: playFor plays the manifest clip and resolves true on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ et: { filename: 'et.mp3', voice: 'v', provider: 'p', generatedAt: 't0' } }),
      }),
    );
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const { playFor } = await import('../src/ui/audio');
    expect(await playFor('et')).toBe(true);
    expect(playSpy).toHaveBeenCalled();
  });

  it('audio: playFor resolves false silently when playback itself rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ et: { filename: 'et.mp3', voice: 'v', provider: 'p', generatedAt: 't0' } }),
      }),
    );
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new Error('NotAllowedError'));
    const { playFor } = await import('../src/ui/audio');
    expect(await playFor('et')).toBe(false);
  });

  it('audio: audioAutoplayEnabled reads and writes the localStorage preference', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    localStorage.removeItem('danmarksliv:audioAutoplay');
    const { audioAutoplayEnabled, setAudioAutoplayEnabled } = await import('../src/ui/audio');
    expect(audioAutoplayEnabled()).toBe(false);
    setAudioAutoplayEnabled(true);
    expect(audioAutoplayEnabled()).toBe(true);
    setAudioAutoplayEnabled(false);
    expect(audioAutoplayEnabled()).toBe(false);
  });
});
