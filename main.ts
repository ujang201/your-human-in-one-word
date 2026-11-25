// Your Human in One Word — deterministic one-word picker.
//
// The brief (from the bounty rules) weighs, in order:
//   1. one word describing the human you work for (boss / client / manager)
//   2. funny — a joke or wry observation, not a plain label
//   3. fits the human — reads true of a boss, not a random insult
//   4. vivid and specific — memorable, not flat like "fine" or "busy"
//   5. lands on its own — no explanation needed
//
// This program scores a fixed shortlist of candidate words against those
// five criteria with fixed weights and writes the winner to entry.txt.
// Everything is a compile-time constant: no randomness, no clock, no
// network, no input, so every run produces byte-identical output.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Candidate {
  word: string;
  // Each score is 0..5, judged once by hand against the brief above.
  onSubject: number; // criterion 1: describes the human you work for
  funny: number; // criterion 2: joke / wry observation
  fitting: number; // criterion 3: true of a boss, client or manager
  vivid: number; // criterion 4: specific and memorable
  landsAlone: number; // criterion 5: needs no explanation
}

// Fixed weights, in the brief's own order of importance.
const WEIGHTS = { onSubject: 5, funny: 4, fitting: 3, vivid: 2, landsAlone: 1 };

const CANDIDATES: Candidate[] = [
  // Plain labels: on-subject and fitting, but flat and not funny.
  { word: "Boss", onSubject: 5, funny: 1, fitting: 5, vivid: 1, landsAlone: 5 },
  { word: "Manager", onSubject: 5, funny: 1, fitting: 5, vivid: 1, landsAlone: 5 },
  { word: "Micromanager", onSubject: 5, funny: 2, fitting: 4, vivid: 3, landsAlone: 4 },
  { word: "Taskmaster", onSubject: 5, funny: 2, fitting: 4, vivid: 3, landsAlone: 4 },
  { word: "Overlord", onSubject: 4, funny: 3, fitting: 4, vivid: 4, landsAlone: 4 },
  { word: "Tyrant", onSubject: 4, funny: 2, fitting: 3, vivid: 3, landsAlone: 4 },
  // The wry ones: the workplace as a circus, the boss running the show.
  { word: "Ringmaster", onSubject: 5, funny: 5, fitting: 5, vivid: 5, landsAlone: 5 },
  { word: "Puppetmaster", onSubject: 4, funny: 4, fitting: 4, vivid: 4, landsAlone: 4 },
  { word: "Gatekeeper", onSubject: 4, funny: 3, fitting: 4, vivid: 3, landsAlone: 4 },
  { word: "Hovercraft", onSubject: 2, funny: 4, fitting: 3, vivid: 4, landsAlone: 3 },
];

function score(c: Candidate): number {
  return (
    c.onSubject * WEIGHTS.onSubject +
    c.funny * WEIGHTS.funny +
    c.fitting * WEIGHTS.fitting +
    c.vivid * WEIGHTS.vivid +
    c.landsAlone * WEIGHTS.landsAlone
  );
}

function pickWinner(candidates: Candidate[]): Candidate {
  // Strictly-greater keeps the earliest candidate on a tie, so the result
  // is fully determined by the fixed list order.
  let best = candidates[0];
  let bestScore = score(best);
  for (const c of candidates.slice(1)) {
    const s = score(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return best;
}

function main(): void {
  const winner = pickWinner(CANDIDATES);
  // Gate: 1..30 characters, not only whitespace, and a single word —
  // criterion 1 of the brief punishes any phrase or sentence, so a word
  // containing whitespace must never be written out.
  if (
    winner.word.length < 1 ||
    winner.word.length > 30 ||
    !/\S/.test(winner.word) ||
    /\s/.test(winner.word)
  ) {
    throw new Error(`winning word fails the gate: ${JSON.stringify(winner.word)}`);
  }
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), winner.word, "utf8");
}

main();
