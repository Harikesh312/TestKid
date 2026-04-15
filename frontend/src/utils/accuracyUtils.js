import levenshtein from "js-levenshtein";

/**
 * Normalise a string for comparison:
 *   - lowercase
 *   - strip punctuation (keep letters, digits, spaces)
 *   - collapse whitespace
 *   - trim
 */
function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate the percentage accuracy between a spoken/written string and a
 * target string using the Levenshtein distance algorithm.
 *
 * @param {string} input  – the user's spoken transcript or OCR text
 * @param {string} target – the reference sentence
 * @returns {number} 0 – 100 (rounded)
 */
export function calculateAccuracy(input, target) {
  const normInput = normalise(input);
  const normTarget = normalise(target);

  if (normTarget.length === 0) return 0;

  const distance = levenshtein(normInput, normTarget);
  const maxLen = Math.max(normInput.length, normTarget.length);

  if (maxLen === 0) return 100; // both empty

  const accuracy = ((maxLen - distance) / maxLen) * 100;
  return Math.max(0, Math.round(accuracy));
}
