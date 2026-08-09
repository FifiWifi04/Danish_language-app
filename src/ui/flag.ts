const FLAG_REASONS: [string, string][] = [
  ['Content wrong', 'content'],
  ['Audio wrong', 'audio'],
  ['Phonetic wrong', 'phonetic'],
  ['Other', 'other'],
];

/**
 * Renders a "flag this card" control: a toggle button that reveals reason
 * choices, persists the choice via `onFlag`, and shows the current flag
 * state — used on every card back per PLAN_PHASE5_MODES.md WS-D / REVIEW A.9.
 */
export function renderFlagControl(
  container: HTMLElement,
  flagged: string | null,
  onFlag: (reason: string) => void,
): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'flag-control';

  const status = document.createElement('span');
  status.className = 'flag-status';
  status.textContent = flagged ? `Flagged: ${flagged}` : '';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = '🚩 Flag';

  const choices = document.createElement('div');
  choices.hidden = true;
  for (const [label, reason] of FLAG_REASONS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      onFlag(reason);
      status.textContent = `Flagged: ${reason}`;
      choices.hidden = true;
    });
    choices.appendChild(button);
  }

  toggle.addEventListener('click', () => {
    choices.hidden = !choices.hidden;
  });

  wrapper.appendChild(toggle);
  wrapper.appendChild(choices);
  wrapper.appendChild(status);
  container.appendChild(wrapper);
}
