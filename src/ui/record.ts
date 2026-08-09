import { playFor } from './audio';

const MAX_DURATION_MS = 5_000;

/**
 * Self-record & compare (PRON WS-D): a record button that captures ≤5s of mic
 * audio into an in-memory blob, then "Yours"/"Reference" A/B replay buttons.
 * Nothing is uploaded or persisted — the blob and its object URL live only in
 * memory for this control's lifetime (revoked on re-record). No scoring.
 * Renders nothing when `MediaRecorder` isn't available (feature-detected —
 * e.g. older iOS).
 */
export function renderRecordControl(container: HTMLElement, referenceText: string): void {
  if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

  const wrap = document.createElement('div');
  wrap.className = 'record-control';

  const explanation = document.createElement('p');
  explanation.className = 'record-explanation';
  explanation.textContent = 'Record yourself and compare with the reference clip — nothing is uploaded or saved.';
  wrap.appendChild(explanation);

  const recordButton = document.createElement('button');
  recordButton.className = 'record-button';
  recordButton.textContent = '🎤 Record yourself';
  recordButton.style.minHeight = '48px';
  wrap.appendChild(recordButton);

  const yoursButton = document.createElement('button');
  yoursButton.className = 'record-yours-button';
  yoursButton.textContent = '▶ Yours';
  yoursButton.style.minHeight = '48px';
  yoursButton.disabled = true;
  wrap.appendChild(yoursButton);

  const referenceButton = document.createElement('button');
  referenceButton.className = 'record-reference-button';
  referenceButton.textContent = '▶ Reference';
  referenceButton.style.minHeight = '48px';
  referenceButton.addEventListener('click', () => void playFor(referenceText));
  wrap.appendChild(referenceButton);

  let recorder: MediaRecorder | null = null;
  let recordedUrl: string | null = null;
  let yoursAudio: HTMLAudioElement | null = null;
  let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

  yoursButton.addEventListener('click', () => {
    if (!recordedUrl) return;
    yoursAudio ??= new Audio();
    yoursAudio.src = recordedUrl;
    void yoursAudio.play();
  });

  recordButton.addEventListener('click', () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      return;
    }
    void startRecording();
  });

  async function startRecording(): Promise<void> {
    recordButton.disabled = true;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      recordButton.disabled = false;
      return;
    }

    const chunks: BlobPart[] = [];
    const active = new MediaRecorder(stream);
    recorder = active;
    active.addEventListener('dataavailable', (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    });
    active.addEventListener('stop', () => {
      if (autoStopTimer !== null) clearTimeout(autoStopTimer);
      for (const track of stream.getTracks()) track.stop();
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      recordedUrl = URL.createObjectURL(new Blob(chunks, { type: active.mimeType || 'audio/webm' }));
      yoursButton.disabled = false;
      recordButton.disabled = false;
      recordButton.textContent = '🎤 Record yourself';
    });

    active.start();
    recordButton.disabled = false;
    recordButton.textContent = '⏹ Stop recording';
    autoStopTimer = setTimeout(() => {
      if (active.state !== 'inactive') active.stop();
    }, MAX_DURATION_MS);
  }

  container.appendChild(wrap);
}
