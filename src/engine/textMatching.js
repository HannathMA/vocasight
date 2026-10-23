/**
 * Text normalization, fuzzy phonetic similarity, and articulation substitution check
 */

/**
 * Normalizes text: Unicode NFC, strips punctuation, whitespace, converts lowercase
 */
export function normalizeSpeechText(text) {
  if (!text) return ''
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”।॥]/g, '')
    .replace(/\s+/g, '')
    .trim()
}

/**
 * Levenshtein distance for string edit calculation
 */
export function levenshteinDistance(a, b) {
  const an = a ? a.length : 0
  const bn = b ? b.length : 0
  if (an === 0) return bn
  if (bn === 0) return an

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0))

  for (let i = 0; i <= an; i++) matrix[0][i] = i
  for (let j = 0; j <= bn; j++) matrix[j][0] = j

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (b.charAt(j - 1) === a.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1]
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        )
      }
    }
  }

  return matrix[bn][an]
}

/**
 * Computes similarity ratio between 0.0 and 1.0
 */
export function calculateSimilarity(str1, str2) {
  const norm1 = normalizeSpeechText(str1)
  const norm2 = normalizeSpeechText(str2)

  if (!norm1 && !norm2) return 1.0
  if (!norm1 || !norm2) return 0.0
  if (norm1 === norm2) return 1.0

  // Substring containment bonus (e.g. if the child said the word inside a longer sentence)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const minLen = Math.min(norm1.length, norm2.length)
    const maxLen = Math.max(norm1.length, norm2.length)
    const subRatio = minLen / maxLen
    if (subRatio >= 0.7) return Math.max(0.85, subRatio)
  }

  const maxLen = Math.max(norm1.length, norm2.length)
  const dist = levenshteinDistance(norm1, norm2)
  const similarity = 1.0 - dist / maxLen

  return Number(Math.max(0, similarity).toFixed(2))
}

/**
 * Checks speech match against target word/sound
 */
export function evaluateSpeechAttempt(transcript, targetText, threshold = 0.78) {
  const similarity = calculateSimilarity(transcript, targetText)
  const isSuccess = similarity >= threshold

  return {
    transcript,
    targetText,
    normalizedTranscript: normalizeSpeechText(transcript),
    normalizedTarget: normalizeSpeechText(targetText),
    similarity,
    isSuccess,
  }
}

/**
 * Identifies if a specific substitution occurred (e.g. ഴ substituted with യ or ള)
 */
export function detectSubstitution(transcript, targetWord, targetSoundSymbol, minimalPairs = []) {
  const normTranscript = normalizeSpeechText(transcript)
  const normTarget = normalizeSpeechText(targetWord)

  if (!normTranscript || normTranscript === normTarget) {
    return null
  }

  // Check if target sound was replaced by one of the minimal pairs
  for (const pair of minimalPairs) {
    const substitutedTarget = normTarget.replaceAll(targetSoundSymbol, pair)
    if (normTranscript.includes(pair) || normTranscript === substitutedTarget) {
      return {
        targetSound: targetSoundSymbol,
        substitutedWith: pair,
        confidence: 'high',
      }
    }
  }

  // General check: if target sound is absent from transcript but transcript has letters
  if (normTarget.includes(targetSoundSymbol) && !normTranscript.includes(targetSoundSymbol)) {
    return {
      targetSound: targetSoundSymbol,
      substitutedWith: normTranscript.charAt(0) || '?',
      confidence: 'medium',
    }
  }

  return null
}
