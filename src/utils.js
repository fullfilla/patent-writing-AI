export function normalizeText(value = "") {
  return value.replace(/\r/g, "").trim();
}

export function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function splitKeywords(input = "") {
  return unique(
    input
      .split(/[\n,，;；/|]/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function slugify(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function countOccurrences(text, patterns) {
  return patterns.reduce((sum, pattern) => {
    const matches = text.match(new RegExp(pattern, "g"));
    return sum + (matches ? matches.length : 0);
  }, 0);
}

export function averageSentenceLength(text) {
  const sentences = text.split(/[。！？!?；;]/).map((item) => item.trim()).filter(Boolean);
  if (!sentences.length) {
    return 0;
  }
  const total = sentences.reduce((sum, sentence) => sum + sentence.length, 0);
  return Number((total / sentences.length).toFixed(1));
}

export function scoreToBand(score) {
  if (score >= 0.75) {
    return "高";
  }
  if (score >= 0.45) {
    return "中";
  }
  return "低";
}

export function toPercent(score) {
  return `${Math.round(score * 100)}%`;
}
