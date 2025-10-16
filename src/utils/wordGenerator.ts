const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "was", "are", "been", "has", "had", "were", "said", "did", "having",
  "may", "should", "could", "might", "must", "can", "need", "find", "give", "tell",
  "work", "seem", "feel", "try", "leave", "call", "hand", "might", "turn", "show",
  "every", "good", "new", "old", "great", "high", "small", "large", "next", "early",
  "young", "important", "few", "public", "bad", "same", "able", "right", "social", "already"
];

const adjectives = [
  "happy", "sad", "quick", "slow", "bright", "dark", "warm", "cold", "big", "small",
  "tall", "short", "wide", "narrow", "thick", "thin", "heavy", "light", "strong", "weak",
  "fast", "slow", "loud", "quiet", "smooth", "rough", "soft", "hard", "clean", "dirty",
  "new", "old", "young", "ancient", "modern", "fresh", "stale", "sweet", "bitter", "sour",
  "beautiful", "ugly", "pretty", "handsome", "gorgeous", "lovely", "charming", "elegant", "graceful", "clumsy",
  "brave", "cowardly", "bold", "timid", "confident", "shy", "proud", "humble", "honest", "dishonest",
  "kind", "cruel", "gentle", "harsh", "friendly", "hostile", "polite", "rude", "generous", "selfish",
  "wise", "foolish", "smart", "stupid", "clever", "dull", "bright", "dim", "sharp", "blunt"
];

const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const characters = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+",
  "[", "]", "{", "}", ";", ":", "'", '"', ",", ".", "<", ">", "/", "?"
];

// utils/wordGenerator.ts

export type TestMode = 'words' | 'numbers' | 'adjectives' | 'characters' | 'punctuation';

const YEAR_POOL = Array.from({ length: 90 }, (_, i) => (1935 + i).toString()); // 1935–2024

const rand = (n: number) => Math.floor(Math.random() * n);

// attach punctuation to a word (sometimes as a hyphen token by itself)
const punctuate = (w: string) => {
  const roll = Math.random();
  if (roll < 0.25) return `${w}.`;
  if (roll < 0.45) return `${w},`;
  if (roll < 0.55) return `-`;          // standalone hyphen
  if (roll < 0.70) return `'${w}`;      // leading apostrophe
  if (roll < 0.85) return `${w}'s`;     // possessive
  return w;
};

export const generateRow = (count = 12, mode: TestMode = 'words'): string[] => {
  const row: string[] = [];
  for (let i = 0; i < count; i++) {
    let token = commonWords[rand(commonWords.length)];

    if (mode === 'adjectives') token = adjectives[rand(adjectives.length)];
    if (mode === 'characters') token = characters[rand(characters.length)];

    if (mode === 'numbers') {
      // ~1 in 4 tokens is a number (or year)
      if (Math.random() < 0.25) {
        token = Math.random() < 0.6 ? YEAR_POOL[rand(YEAR_POOL.length)] : String(rand(9999));
      }
    }
    if (mode === 'punctuation') {
      // 35% chance to add/replace with punctuation form
      if (Math.random() < 0.35) token = punctuate(token);
    }

    row.push(token);
  }
  return row;
};

// keep your existing commonWords/adjectives/characters arrays below…

