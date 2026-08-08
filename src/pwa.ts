import { registerSW } from 'virtual:pwa-register';

interface ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  autoDismissMs?: number;
}

function showToast(message: string, opts: ToastOptions = {}): void {
  const toast = document.createElement('div');
  toast.className = 'pwa-toast';
  toast.setAttribute('role', 'status');

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  const button = document.createElement('button');
  button.textContent = opts.actionLabel ?? 'Dismiss';
  button.addEventListener('click', () => {
    opts.onAction?.();
    toast.remove();
  });
  toast.appendChild(button);

  document.body.appendChild(toast);

  if (opts.autoDismissMs !== undefined) {
    setTimeout(() => toast.remove(), opts.autoDismissMs);
  }
}

export function initPwa(): void {
  const updateSW = registerSW({
    onNeedRefresh() {
      showToast('New version — reload', {
        actionLabel: 'Reload',
        onAction: () => void updateSW(true),
      });
    },
    onOfflineReady() {
      showToast('Works offline now', { autoDismissMs: 5000 });
    },
  });
}
