/**
 * PDF Clinical Summary Report Generator using jsPDF
 * Formatted for discussion with Speech-Language Pathologists (SLPs)
 */
import { jsPDF } from 'jspdf'

export function generateClinicalReport({
  languageName = 'Malayalam',
  languageCode = 'ml',
  history = [],
  stars = 0,
  streakDays = 1,
  completedSounds = [],
  allSounds = [],
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 18

  // Header Banner
  doc.setFillColor(78, 205, 196) // Teal
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.text('VocaSight Kids - Speech Practice Summary', 14, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Informational Practice Report for Speech-Language Pathologist Review', 14, 22)

  y = 36

  // Medical & Clinical Disclaimer Box
  doc.setFillColor(254, 243, 199) // Light amber
  doc.setDrawColor(245, 158, 11)
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(180, 83, 9)
  doc.text('IMPORTANT CLINICAL NOTICE & DISCLAIMER:', 18, y + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(120, 53, 15)
  const disclaimerText =
    'VocaSight Kids is a playful digital practice companion, NOT a diagnostic tool. All observations and pattern indicators are rule-based acoustic metrics designed to facilitate informed discussions between parents and qualified Speech-Language Pathologists (SLPs).'
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - 36)
  doc.text(splitDisclaimer, 18, y + 11)

  y += 28

  // Session Meta
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  doc.text('Session & Practice Overview', 14, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  doc.text(`Report Date: ${dateStr}`, 14, y)
  doc.text(`Active Language: ${languageName} (${languageCode.toUpperCase()})`, 90, y)
  y += 5
  doc.text(`Total Practice Attempts: ${history.length}`, 14, y)
  doc.text(`Earned Stars: ${stars} ⭐`, 90, y)
  doc.text(`Current Streak: ${streakDays} days 🔥`, 150, y)
  y += 5
  doc.text(
    `Sounds Practiced: ${completedSounds.length} of ${allSounds.length} sounds`,
    14,
    y
  )
  y += 10

  // Line separator
  doc.setDrawColor(226, 232, 240)
  doc.line(14, y, pageWidth - 14, y)
  y += 8

  // Section 2: Observed Articulation Patterns
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  doc.text('Observed Articulation Substitution Patterns', 14, y)
  y += 6

  // Calculate substitutions that repeated >= 3 times
  const substitutionCounts = {}
  for (const att of history) {
    if (att.substitution && att.substitution.substitutedWith) {
      const key = `${att.soundSymbol || att.soundId} -> ${att.substitution.substitutedWith}`
      substitutionCounts[key] = (substitutionCounts[key] || 0) + 1
    }
  }

  const flaggedPatterns = Object.entries(substitutionCounts).filter(([_, count]) => count >= 3)

  if (flaggedPatterns.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(225, 29, 72)
    for (const [pat, count] of flaggedPatterns) {
      doc.text(
        `• Pattern flagged: ${pat} (Repeated in ${count} attempts) — Suggest discussing tongue positioning with SLP.`,
        18,
        y
      )
      y += 6
    }
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(
      '• No persistent substitution patterns detected (threshold: >= 3 repeated mismatches for the same sound).',
      18,
      y
    )
    y += 6
  }

  y += 4

  // Section 3: Observed Fluency Patterns (Rule-based indicators)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  doc.text('Acoustic Fluency Observations (Informational Rule-Based)', 14, y)
  y += 6

  let prolongationCount = 0
  let blockCount = 0
  let repetitionCount = 0

  for (const att of history) {
    if (att.disfluencyFlags) {
      if (att.disfluencyFlags.prolongation?.detected) prolongationCount++
      if (att.disfluencyFlags.block?.detected) blockCount++
      if (att.disfluencyFlags.repetition?.detected) repetitionCount++
    }
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(
    `• Prolongation occurrences (>1.2s continuous voicing): ${prolongationCount} times observed.`,
    18,
    y
  )
  y += 5
  doc.text(
    `• Hesitation / Block occurrences (>1.0s initial or intra-word silence): ${blockCount} times observed.`,
    18,
    y
  )
  y += 5
  doc.text(
    `• Rapid repetition bursts / word restarts: ${repetitionCount} times observed.`,
    18,
    y
  )
  y += 9

  // Line separator
  doc.setDrawColor(226, 232, 240)
  doc.line(14, y, pageWidth - 14, y)
  y += 7

  // Section 4: Recent Attempt Log Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  doc.text('Recent Practice Logs (Most Recent 10 Attempts)', 14, y)
  y += 6

  // Table header
  doc.setFillColor(241, 245, 249)
  doc.rect(14, y, pageWidth - 28, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)
  doc.text('Date & Time', 16, y + 5)
  doc.text('Target Word', 55, y + 5)
  doc.text('Transcript Check', 95, y + 5)
  doc.text('Accuracy', 140, y + 5)
  doc.text('Practice Track', 170, y + 5)
  y += 9

  const recent = history.slice(-10).reverse()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  if (recent.length === 0) {
    doc.setTextColor(148, 163, 184)
    doc.text('No practice records found yet.', 18, y + 4)
    y += 10
  } else {
    for (const r of recent) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      const timeDisplay = new Date(r.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      doc.setTextColor(71, 85, 105)
      doc.text(timeDisplay, 16, y)
      doc.text(r.targetWord || '-', 55, y)
      doc.text(r.transcript ? `"${r.transcript.slice(0, 18)}"` : 'Audio check', 95, y)

      const acc = Math.round((r.similarity || 0) * 100)
      if (r.isSuccess) {
        doc.setTextColor(16, 185, 129) // Green
        doc.text(`${acc}% (Achieved)`, 140, y)
      } else {
        doc.setTextColor(245, 158, 11) // Amber
        doc.text(`${acc}% (Encouraged)`, 140, y)
      }

      doc.setTextColor(100, 116, 139)
      doc.text(r.track || 'normal', 170, y)

      y += 6
    }
  }

  y += 10
  // Footer Notes
  if (y > 265) {
    doc.addPage()
    y = 20
  }
  doc.setDrawColor(203, 213, 225)
  doc.line(14, y, pageWidth - 14, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('Clinician & Parent Discussion Notes:', 14, y)
  y += 12

  doc.setDrawColor(226, 232, 240)
  doc.line(14, y, pageWidth - 14, y)
  y += 8
  doc.line(14, y, pageWidth - 14, y)

  // Save the PDF
  const filename = `VocaSight_Report_${languageCode}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
  return filename
}
