import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderRecordControl } from '../src/ui/record';

class FakeMediaRecorder extends EventTarget {
  state: 'inactive' | 'recording' = 'inactive';
  mimeType = 'audio/webm';
  stream: MediaStream;
  constructor(stream: MediaStream) {
    super();
    this.stream = stream;
  }
  start(): void {
    this.state = 'recording';
  }
  stop(): void {
    this.state = 'inactive';
    const dataEvent = new Event('dataavailable') as Event & { data: Blob };
    Object.defineProperty(dataEvent, 'data', { value: new Blob(['x']) });
    this.dispatchEvent(dataEvent);
    this.dispatchEvent(new Event('stop'));
  }
}

function fakeStream(): MediaStream {
  return { getTracks: () => [] } as unknown as MediaStream;
}

function stubMediaRecorderSupport(): void {
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn().mockResolvedValue(fakeStream()) },
    configurable: true,
  });
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('record', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('record: renders nothing when MediaRecorder is unavailable (feature-detect)', () => {
    const container = document.createElement('div');
    renderRecordControl(container, 'ny');
    expect(container.querySelector('.record-control')).toBeNull();
  });

  it('record: the yours button enables once a recording stops', async () => {
    stubMediaRecorderSupport();
    const container = document.createElement('div');
    renderRecordControl(container, 'ny');

    const recordButton = container.querySelector<HTMLButtonElement>('.record-button');
    const yoursButton = container.querySelector<HTMLButtonElement>('.record-yours-button');
    expect(yoursButton?.disabled).toBe(true);

    recordButton?.click();
    await flushMicrotasks();
    expect(recordButton?.textContent).toBe('⏹ Stop recording');

    recordButton?.click(); // manual early stop, well under the 5s cap
    expect(yoursButton?.disabled).toBe(false);
    expect(recordButton?.textContent).toBe('🎤 Record yourself');
  });

  it('record: the reference button plays the reference clip, not the recording', async () => {
    stubMediaRecorderSupport();
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ny: { filename: 'ny.mp3', voice: 'v', provider: 'p', generatedAt: 't0' } }),
      }),
    );

    const container = document.createElement('div');
    renderRecordControl(container, 'ny');
    container.querySelector<HTMLButtonElement>('.record-reference-button')?.click();
    await flushMicrotasks();

    expect(playSpy).toHaveBeenCalled();
  });
});
