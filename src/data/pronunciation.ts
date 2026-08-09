import pronunciationFile from '../../content/pronunciation.v1.json';

export interface PracticeWord {
  word: string;
  gloss_pl: string;
}

export interface MinimalPair {
  a: string;
  b: string;
  gloss_a_pl: string;
  gloss_b_pl: string;
}

export interface ExampleSentence {
  danish: string;
  gloss_pl: string;
}

export interface PronunciationItem {
  id: string;
  status: 'draft' | 'reviewed';
  title_da: string;
  title_pl: string;
  whatItIs_pl: string;
  mechanics_pl: string[];
  polishTrap_pl: string;
  anchor_pl: string;
  practiceWords: PracticeWord[];
  minimalPairs?: MinimalPair[];
  exampleSentence?: ExampleSentence;
}

interface PronunciationFile {
  v: number;
  type: string;
  items: PronunciationItem[];
}

/** The pronunciation guide is a single fixed content file, bundled like the deck. */
export function loadPronunciationGuide(): PronunciationItem[] {
  return (pronunciationFile as PronunciationFile).items;
}
