# VocaSight Kids 🌈
### Multi-Language, Browser-Based Speech Practice Companion for Children

**VocaSight Kids** is an interactive, child-friendly speech practice companion running **100% in the browser**. It combines:
1. **Magic Mouth Mirror** — Live webcam face tracking using MediaPipe Face Landmarker with real-time lip landmark contours and blendshape matching.
2. **Live Voice Waveform** — Web Audio API 60 FPS oscilloscope with silence-based auto-stop, easy-onset smooth guide, and slow-speech pacing bar.
3. **On-Device Whisper Speech Check** — Client-side Whisper models (`whisper-tiny`, `whisper-base`, `whisper-small`) executed in a dedicated Web Worker via Transformers.js ONNX runtime.
4. **Articulation & Fluency Pattern Support** — Non-diagnostic acoustic observations (prolongation, blocks, repetitions, and substitution pattern flags).
5. **Gamification Layer** — Sound Quest Adventure Map, AI Speech Buddy robot, My Speech Garden with flower growth, and Talking Animal Challenges (Elephant, Rabbit, Parrot).
6. **Parent & Clinical Dashboard** — Local storage progress, exportable PDF clinical report (jsPDF), and one-click data erasure.

> ⚠️ **Important Clinical Notice**: VocaSight Kids is designed as an engaging, playful practice companion. **It is NOT a medical or diagnostic tool and does NOT replace professional speech-language therapy.**

---

## 🌟 Fixed Model Choices & Architecture

- **Voice / Speech Recognition**: Hugging Face `onnx-community/whisper-tiny` (default for fast startup), with configurable runtime selection for `whisper-base` and `whisper-small` via `@huggingface/transformers`.
  - Runs in a non-blocking **Web Worker** (`src/workers/whisper.worker.js`) with WebGPU acceleration and WASM CPU fallback.
  - Real-time download progress feedback.
  - Automatic silence auto-stop and in-memory audio playback.
  - Unicode NFC normalization and phonetic edit-distance matching.
- **Face Tracking**: `@mediapipe/tasks-vision` `FaceLandmarker` with `outputFaceBlendshapes: true`, runningMode `"VIDEO"`, GPU delegate with CPU fallback.
  - Computes 5-frame moving average over `jawOpen`, `mouthFunnel`, `mouthPucker`, `mouthClose`, `mouthStretch`, and `mouthSmile`.
  - 2-second relaxed neutral face calibration baseline.
  - Glowing lip landmarks and live target shape match glow.
  - Graceful fallback when camera is denied or face is not detected.
- **Zero Backend**: Everything runs client-side. No audio, video, or biometric data is ever sent to a server.

---

## 🌐 Supported Regional Languages & Pack System

VocaSight Kids ships with built-in language packs:
- **Malayalam (മലയാളം)**: `ഴ`, `ള`, `റ`
- **Hindi (हिन्दी)**: `ड़`, `ढ़`, `ट`
- **English**: `th`, `r`, `l`, `s`
- **Tamil (தமிழ்)**: `ழ`, `ள`, `ற`
- **Telugu (తెలుగు)**: `ళ`, `ట`, `డ`
- **Kannada (ಕನ್ನಡ)**: `ಳ`, `ಟ`, `ಡ`

### Adding a New Language (Zero Code Change)
Create `src/data/sounds.<lang>.json` following the schema:
```json
{
  "language": "ml",
  "whisperLang": "malayalam",
  "sounds": [
    {
      "id": "zha",
      "symbol": "ഴ",
      "translit": "zha",
      "tip": "Curl tongue back softly, lips rounded slightly",
      "words": [
        { "text": "മഴ", "translit": "mazha", "meaning": "Rain", "icon": "🌧️" }
      ],
      "syllables": ["ഴ", "ഴി", "ഴു", "ഴെ"],
      "phrase": "മഴ പെയ്യുന്നു",
      "sentence": "മഴത്തുള്ളികൾ മണ്ണിൽ വീഴുന്നു",
      "targetMouth": { "jawOpen": [0.15, 0.45], "mouthFunnel": [0.15, 0.65] },
      "quest": { "area": "rain-forest", "name": "Rain Forest Oasis", "themeColor": "#059669" },
      "minimalPairs": ["ള", "യ"]
    }
  ],
  "buddyPhrases": {
    "encourage": ["Great job! Let's say it together!"],
    "retry": ["No worries, let's try slow and calm!"],
    "celebrate": ["Woohoo! Sparkling star earned!"]
  }
}
```

---

## 🚀 Screens & Features

1. **Welcome Screen**: Mascot animation, regional language picker, "Start Adventure" CTA, privacy badge, and parental consent modal before camera/mic access.
2. **Sound Selection**: Card grid and Quest Map toggle, sample audio pronunciations with Web SpeechSynthesis fallback, minimal sound pairs.
3. **Magic Mouth Mirror & Practice**: Mirrored webcam with glowing mouth landmarks, live 60 FPS waveform, slow pacing bar, easy-onset curve, and Listen / Speak buttons.
4. **Reward Screen**: Earned gold stars, confetti fireworks, mirror sparkle, Speech Buddy cheers, and "Next Sound" progression.
5. **My Speech Garden**: Gamified practice where completed sounds award water drops to grow flower sprouts into blooming golden blossoms.
6. **Talking Animal Friends**: Ollie Elephant introduces words, Barnaby Bunny plays audio, and Pip Parrot encourages speaking.
7. **Parent & Progress Dashboard**: Track session statistics, view recurring substitution patterns (&ge; 3 repetitions), review rule-based fluency metrics, export printable clinical PDF reports (jsPDF), and erase local data.
8. **Settings & Accessibility**: High-contrast theme toggle, adjustable pacing speed (1.0x vs 0.75x), regional language switch, and on-device Whisper model selector.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- Modern web browser (Chrome, Edge, Firefox, Safari) with WebGPU or WebAssembly SIMD support
- Camera and microphone

### Installation
```bash
git clone https://github.com/your-username/vocasight.git
cd vocasight
npm install
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

### Deployment (Vercel / Netlify)
> 🔒 **HTTPS Requirement**: Modern browsers require HTTPS (or localhost) for `navigator.mediaDevices.getUserMedia` (webcam & microphone access). Ensure your Vercel or Netlify deployment has SSL/HTTPS enabled.

---

## ⚠️ Known Limitations

1. **Tongue Occlusion in Face Tracking**: MediaPipe Face Landmarker tracks outer/inner lip contours and facial blendshapes, but cannot directly view the intra-oral tongue position. Retroflex sounds (like retroflex `ഴ` or `ള`) cannot be judged from facial landmarks alone.
2. **Child Speech Acoustic Variability**: Standard Whisper models (`whisper-small`, `whisper-tiny`) are trained predominantly on adult acoustic corpora and may exhibit higher error rates with younger child voices. Fine-tuning on pediatric speech corpora would enhance accuracy.
3. **Rule-Based Fluency Indicators**: Fluency observations (prolongation, block, repetition) are acoustic rule-based indicators and only provide **"possible patterns"** for parental awareness and clinical consultation.
4. **Clinical Validation**: Needs expert review and clinical validation by licensed Speech-Language Pathologists (SLPs) before any clinical or therapeutic deployment.

---

## 📄 License
MIT License. Created for hackathons and pediatric speech companion research.
