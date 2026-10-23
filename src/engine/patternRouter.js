/**
 * Pattern Router for VocaSight Kids
 * Evaluates child speech history and routes to the most supportive practice track:
 * - 'fluency' track (breathing, slow speech pacing bar, easy-onset curve)
 * - 'articulation' track (mouth shape guide, isolated sound -> syllable -> word -> sentence ladder)
 * - 'both' (offers recommendation button for both)
 * - 'normal' (standard gamified practice)
 */

export function routePracticeTrack({
  attemptHistory = [],
  currentDisfluency = null,
  currentSubstitution = null,
  soundId = null,
}) {
  // 1. Check historical disfluencies in recent attempts (last 5 attempts)
  const recentAttempts = attemptHistory.slice(-6)
  const disfluencyEventsCount = recentAttempts.filter(
    (a) => a.disfluencyFlags && a.disfluencyFlags.hasDisfluency
  ).length

  const currentHasDisfluency = Boolean(currentDisfluency && currentDisfluency.hasDisfluency)
  const isHighDisfluency = disfluencyEventsCount >= 2 || currentHasDisfluency

  // 2. Check recurring articulation substitutions for current sound
  // Flag only if the same mismatch repeats in at least 3 attempts for the same sound
  const sameSoundAttempts = attemptHistory.filter((a) => a.soundId === soundId)
  const substitutionCounts = {}

  for (const att of sameSoundAttempts) {
    if (att.substitution && att.substitution.substitutedWith) {
      const subKey = att.substitution.substitutedWith
      substitutionCounts[subKey] = (substitutionCounts[subKey] || 0) + 1
    }
  }

  let hasRecurringSubstitution = false
  let recurringSubstitutionDetails = null

  for (const [subLetter, count] of Object.entries(substitutionCounts)) {
    if (count >= 3) {
      hasRecurringSubstitution = true
      recurringSubstitutionDetails = {
        targetSound: soundId,
        substitutedWith: subLetter,
        count,
      }
      break
    }
  }

  // Also check if current attempt had low accuracy with articulation mismatch
  const currentHasSubstitution = Boolean(currentSubstitution)

  // 3. Routing decision
  if (isHighDisfluency && !hasRecurringSubstitution) {
    return {
      recommendedTrack: 'fluency',
      reason: 'Supportive calm rhythm and easy onset practice recommended.',
      hasRecurringSubstitution,
      recurringSubstitutionDetails,
      isHighDisfluency,
    }
  }

  if (!isHighDisfluency && (hasRecurringSubstitution || (currentHasSubstitution && sameSoundAttempts.length >= 2))) {
    return {
      recommendedTrack: 'articulation',
      reason: 'Focused mouth-shape guide and step-by-step articulation ladder recommended.',
      hasRecurringSubstitution,
      recurringSubstitutionDetails,
      isHighDisfluency,
    }
  }

  if (isHighDisfluency && hasRecurringSubstitution) {
    return {
      recommendedTrack: 'both',
      reason: 'Both calm fluency pacing and articulation ladder can be explored!',
      hasRecurringSubstitution,
      recurringSubstitutionDetails,
      isHighDisfluency,
    }
  }

  return {
    recommendedTrack: 'normal',
    reason: 'Standard fun adventure practice.',
    hasRecurringSubstitution,
    recurringSubstitutionDetails,
    isHighDisfluency,
  }
}
