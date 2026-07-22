export function sanitizeWord(word: string) {
  return word.endsWith(' ') ? word.slice(0, -1) : word;
}
