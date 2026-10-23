/**
 * Mouth metrics calculation, smoothing, and calibration engine for VocaSight Kids.
 */

// MediaPipe Lip Landmark indices
export const LIP_LANDMARK_INDICES = [
  // Outer lips
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
  // Inner lips
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95
]

export const LIP_CONTOUR_OUTER = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61
]

export const LIP_CONTOUR_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78
]

/**
 * Extracts and smooths the key mouth blendshapes
 */
export class MouthMetricsSmoother {
  constructor(windowSize = 5) {
    this.windowSize = windowSize
    this.history = []
    this.calibrationOffset = {
      jawOpen: 0,
      mouthFunnel: 0,
      mouthPucker: 0,
      mouthClose: 0,
      mouthStretch: 0,
      mouthSmile: 0,
    }
  }

  reset() {
    this.history = []
  }

  setCalibration(baselineMetrics) {
    this.calibrationOffset = { ...baselineMetrics }
  }

  /**
   * Blendshape categories parser from MediaPipe faceBlendshapes
   */
  extractRawBlendshapes(blendshapes) {
    if (!blendshapes || blendshapes.length === 0) return null

    const categories = blendshapes[0]?.categories || []
    const map = {}
    for (const c of categories) {
      map[c.categoryName] = c.score
    }

    const jawOpen = map['jawOpen'] || 0
    const mouthFunnel = map['mouthFunnel'] || 0
    const mouthPucker = map['mouthPucker'] || 0
    const mouthClose = map['mouthClose'] || 0

    // Average left and right for stretch and smile
    const stretchLeft = map['mouthStretchLeft'] || 0
    const stretchRight = map['mouthStretchRight'] || 0
    const mouthStretch = (stretchLeft + stretchRight) / 2

    const smileLeft = map['mouthSmileLeft'] || 0
    const smileRight = map['mouthSmileRight'] || 0
    const mouthSmile = (smileLeft + smileRight) / 2

    return {
      jawOpen,
      mouthFunnel,
      mouthPucker,
      mouthClose,
      mouthStretch,
      mouthSmile,
    }
  }

  /**
   * Push new frame and calculate smoothed average
   */
  processFrame(blendshapes) {
    const raw = this.extractRawBlendshapes(blendshapes)
    if (!raw) return null

    this.history.push(raw)
    if (this.history.length > this.windowSize) {
      this.history.shift()
    }

    // Moving average
    const smoothed = {
      jawOpen: 0,
      mouthFunnel: 0,
      mouthPucker: 0,
      mouthClose: 0,
      mouthStretch: 0,
      mouthSmile: 0,
    }

    const count = this.history.length
    for (const item of this.history) {
      for (const key of Object.keys(smoothed)) {
        smoothed[key] += item[key]
      }
    }

    for (const key of Object.keys(smoothed)) {
      smoothed[key] = Number((smoothed[key] / count).toFixed(3))
    }

    // Calibrated relative metrics (baseline subtracted with non-negative clamping)
    const calibrated = {}
    for (const key of Object.keys(smoothed)) {
      calibrated[key] = Math.max(0, Number((smoothed[key] - (this.calibrationOffset[key] || 0) * 0.4).toFixed(3)))
    }

    return {
      raw,
      smoothed,
      calibrated,
    }
  }

  /**
   * Matches live calibrated metrics against a sound target profile
   * targetMouth e.g. { jawOpen: [0.15, 0.5], mouthFunnel: [0.2, 0.7] }
   * Returns match score between 0.0 and 1.0, plus individual criteria matches
   */
  evaluateMatch(metrics, targetProfile) {
    if (!metrics || !targetProfile) return { score: 0.5, isMatch: false, details: {} }

    let totalScore = 0
    let criteriaCount = 0
    const details = {}

    for (const [key, range] of Object.entries(targetProfile)) {
      if (!Array.isArray(range) || range.length !== 2) continue
      criteriaCount++
      const [minVal, maxVal] = range
      const currentVal = metrics[key] ?? 0

      let metricScore = 0
      if (currentVal >= minVal && currentVal <= maxVal) {
        metricScore = 1.0
      } else if (currentVal < minVal) {
        const diff = minVal - currentVal
        metricScore = Math.max(0, 1.0 - diff / (minVal || 0.1))
      } else {
        const diff = currentVal - maxVal
        metricScore = Math.max(0, 1.0 - diff / (maxVal || 0.1))
      }

      details[key] = {
        current: currentVal,
        target: range,
        score: Number(metricScore.toFixed(2)),
        inRange: currentVal >= minVal && currentVal <= maxVal,
      }
      totalScore += metricScore
    }

    const averageScore = criteriaCount > 0 ? Number((totalScore / criteriaCount).toFixed(2)) : 0.7
    return {
      score: averageScore,
      isMatch: averageScore >= 0.7,
      details,
    }
  }
}
