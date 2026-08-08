import type { ProgressStore } from '../core/store';
import { LAST_EXPORT_KEY } from './backup-status';

const CONFIRM_MESSAGE = 'Importing will replace all current progress. Continue?';

function backupFilename(nowMs: number): string {
  const date = new Date(nowMs).toISOString().slice(0, 10);
  return `danmarksliv-backup-${date}.json`;
}

async function doExport(store: ProgressStore): Promise<void> {
  const json = await store.exportAll();
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFilename(Date.now());
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem(LAST_EXPORT_KEY, String(Date.now()));
}

async function doImport(store: ProgressStore, file: File, statusEl: HTMLElement): Promise<void> {
  if (!window.confirm(CONFIRM_MESSAGE)) return;
  try {
    await store.importAll(await file.text());
    statusEl.textContent = 'Import complete.';
  } catch (err) {
    statusEl.textContent = err instanceof Error ? err.message : 'Import failed.';
  }
}

/** Renders Export/Import backup controls into `container`. Self-contained: no state escapes this call. */
export function renderBackupControls(container: HTMLElement, store: ProgressStore): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'backup-controls';

  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export backup';
  exportBtn.addEventListener('click', () => void doExport(store));

  const importBtn = document.createElement('button');
  importBtn.textContent = 'Import backup';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  fileInput.style.display = 'none';

  const status = document.createElement('p');
  status.className = 'backup-import-status';

  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    void doImport(store, file, status);
  });

  wrapper.appendChild(exportBtn);
  wrapper.appendChild(importBtn);
  wrapper.appendChild(fileInput);
  wrapper.appendChild(status);
  container.appendChild(wrapper);
}
