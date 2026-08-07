import { renderShell } from './ui/shell';

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  renderShell(root);
}
