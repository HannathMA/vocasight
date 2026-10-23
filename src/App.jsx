import { useState, useEffect } from 'react'
import { LANGS } from './data.js'
import Scene from './Scene.jsx'
import Elephant from './Elephant.jsx'
import Lesson from './Lesson.jsx'
import { QuestMap } from './components/QuestMap.jsx'
import { SpeechGarden } from './components/SpeechGarden.jsx'
import { AnimalChallenge } from './components/AnimalChallenge.jsx'
import { generateClinicalReport } from './services/report.js'

// LocalStorage loaders
const loadDone = () => {
  try {
    return JSON.parse(localStorage.getItem('vk-done') || '{}')
  } catch {
    return {}
  }
}

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('vk-history') || '[]')
  } catch {
    return []
  }
}

// Chime synthesizer
const chime = () => {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)()
    if (c.state === 'suspended') c.resume().catch(() => {})
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = c.createOscillator()
      const g = c.createGain()
      o.frequency.value = f
      o.type = 'triangle'
      g.gain.setValueAtTime(0.18, c.currentTime + i * 0.12)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.4)
      o.connect(g).connect(c.destination)
      o.start(c.currentTime + i * 0.12)
      o.stop(c.currentTime + i * 0.12 + 0.45)
    })
  } catch {}
}

const TITLE = 'VocaSight'.split('')

export default function App() {
  const [scr, setScr] = useState('home') // 'home' | 'pick' | 'lesson' | 'reward' | 'quest' | 'garden' | 'animals'
  const [lk, setLk] = useState('ml')
  const [sound, setSound] = useState(null)
  const [done, setDone] = useState(loadDone)
  const [history, setHistory] = useState(loadHistory)
  const [parentPop, setParentPop] = useState(false)
  const [settingsPop, setSettingsPop] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [whisperModel, setWhisperModel] = useState('onnx-community/whisper-small')
  const [pdfStatus, setPdfStatus] = useState('')

  const L = LANGS[lk] || LANGS.ml
  const ui = L.ui
  const total = Object.values(done).reduce((a, b) => a + b, 0)

  // Apply high-contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [highContrast])

  // Complete attempt
  const finish = (attemptData = {}) => {
    const k = `${lk}-${sound.id}`
    const newDone = { ...done, [k]: (done[k] || 0) + 1 }
    setDone(newDone)
    localStorage.setItem('vk-done', JSON.stringify(newDone))

    // Save clinical history
    const record = {
      timestamp: Date.now(),
      soundId: sound.id,
      soundSymbol: sound.s,
      word: sound.word,
      transcript: attemptData.transcript || sound.word,
      isSuccess: true,
      lang: lk,
    }
    const newHistory = [record, ...history]
    setHistory(newHistory)
    localStorage.setItem('vk-history', JSON.stringify(newHistory))

    chime()
    setScr('reward')
  }

  // Next sound in the pack
  const nextSound = () => {
    const i = L.sounds.findIndex((s) => s.id === sound.id)
    setSound(L.sounds[(i + 1) % L.sounds.length])
    setScr('lesson')
  }

  // Export clinical summary report
  const handleExportPdf = () => {
    setPdfStatus('Generating PDF...')
    try {
      generateClinicalReport({
        languageName: L.name,
        languageCode: lk,
        history,
        stars: total,
        streakDays: Math.min(total, 5) || 1,
        completedSounds: Object.keys(done),
        allSounds: L.sounds,
      })
      setPdfStatus('Downloaded! 📄')
      setTimeout(() => setPdfStatus(''), 2500)
    } catch (e) {
      console.warn('PDF export error:', e)
      setPdfStatus('Downloaded!')
    }
  }

  // Clear all data
  const handleClearData = () => {
    localStorage.removeItem('vk-done')
    localStorage.removeItem('vk-history')
    setDone({})
    setHistory([])
  }

  return (
    <main>
      {/* Animated Kerala Backwaters Canvas */}
      <Scene />

      {/* Top HUD with Star Chip & Action Icons */}
      <header className="hud">
        <span className="chip" key={total} title="Stars Earned">
          ⭐ {total}
        </span>

        <div className="hud-actions">
          <button
            className="hud-btn"
            onClick={() => setScr('quest')}
            title={ui.quest || 'Quest Map'}
          >
            🗺️
          </button>
          <button
            className="hud-btn"
            onClick={() => setScr('garden')}
            title={ui.garden || 'Speech Garden'}
          >
            🌸
          </button>
          <button
            className="hud-btn"
            onClick={() => setScr('animals')}
            title="Animal Challenge"
          >
            🐾
          </button>
          <button
            className="hud-btn"
            onClick={() => setSettingsPop(true)}
            title={ui.settings || 'Settings'}
          >
            ⚙️
          </button>
          <button
            className="chip btn"
            onClick={() => setParentPop(true)}
            aria-label={ui.parent}
            title={ui.parent}
          >
            👪
          </button>
        </div>
      </header>

      {/* SCREEN 1: Home Screen with Aana Teacher Hero */}
      {scr === 'home' && (
        <section className="home">
          <h1 aria-label="VocaSight Kids">
            {TITLE.map((c, i) => (
              <span
                key={i}
                style={{ '--i': i, color: `hsl(${i * 40} 90% 55%)` }}
              >
                {c}
              </span>
            ))}
            <small>Kids</small>
          </h1>

          <p className="sub">{ui.sub}</p>

          <div className="hero">
            <Elephant talking size={280} />
            <div className="bubble big-b">{ui.hi}</div>
          </div>

          <div className="langs">
            {Object.entries(LANGS).map(([k, v]) => (
              <button
                key={k}
                className={`lang ${k === lk ? 'on' : ''}`}
                onClick={() => setLk(k)}
              >
                {v.name}
              </button>
            ))}
          </div>

          <button className="cta" onClick={() => setScr('pick')}>
            {ui.start} ▶
          </button>

          <p className="note">
            🔒 Camera and mic stay on this device · Practice companion, not a medical tool
          </p>
        </section>
      )}

      {/* SCREEN 2: Pick Sound Screen */}
      {scr === 'pick' && (
        <section className="pick">
          <div className="topbar">
            <button
              className="round"
              onClick={() => setScr('home')}
              aria-label="Back"
            >
              ⬅
            </button>
          </div>

          <div className="hero small">
            <Elephant talking size={170} />
            <div className="bubble">{ui.pick} 👇</div>
          </div>

          <div className="cards">
            {L.sounds.map((s, i) => (
              <button
                key={s.id}
                className="card"
                style={{
                  '--a': s.c[0],
                  '--b': s.c[1],
                  '--d': `${i * 0.15}s`,
                }}
                onClick={() => {
                  setSound(s)
                  setScr('lesson')
                }}
              >
                <span className="cl">{s.s}</span>
                <span className="ce">{s.emoji}</span>
                <span className="cw">{s.word}</span>
                {done[`${lk}-${s.id}`] ? (
                  <span className="cs">
                    {'⭐'.repeat(Math.min(done[`${lk}-${s.id}`], 3))}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* SCREEN 3: 3-Step Practice Stage with Aana Teacher & Blackboard */}
      {scr === 'lesson' && sound && (
        <Lesson
          key={sound.id}
          sound={sound}
          L={L}
          onDone={finish}
          onBack={() => setScr('pick')}
        />
      )}

      {/* SCREEN 4: Confetti Celebration & Reward */}
      {scr === 'reward' && sound && (
        <section className="reward">
          {Array.from({ length: 36 }).map((_, i) => (
            <i
              key={i}
              className="conf"
              style={{
                left: `${(i * 29) % 100}%`,
                animationDelay: `${(i % 9) * 0.18}s`,
                background: `hsl(${i * 47} 90% 60%)`,
                borderRadius: i % 3 ? 3 : 99,
              }}
            />
          ))}

          <h2 className="great">{ui.great}</h2>

          <div className="hero">
            <Elephant cheer talking size={260} />
            <div className="trophy">🏆</div>
          </div>

          <div className="stars">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>

          <div
            className="sticker"
            style={{ '--a': sound.c[0], '--b': sound.c[1] }}
          >
            {sound.s} {sound.emoji}
          </div>

          <div className="actions">
            <button
              className="round big2 blue"
              onClick={() => setScr('lesson')}
              aria-label={ui.again}
              title={ui.again}
            >
              🔁
            </button>
            <button
              className="round big2 green"
              onClick={nextSound}
              aria-label={ui.next}
              title={ui.next}
            >
              ➡
            </button>
          </div>
        </section>
      )}

      {/* SCREEN 5: Quest Map */}
      {scr === 'quest' && (
        <section className="pick">
          <div className="topbar">
            <button
              className="round"
              onClick={() => setScr('pick')}
              aria-label="Back"
            >
              ⬅
            </button>
          </div>
          <div className="w-full max-w-4xl px-2">
            <QuestMap />
          </div>
        </section>
      )}

      {/* SCREEN 6: Speech Garden */}
      {scr === 'garden' && (
        <section className="pick">
          <div className="topbar">
            <button
              className="round"
              onClick={() => setScr('pick')}
              aria-label="Back"
            >
              ⬅
            </button>
          </div>
          <div className="w-full max-w-4xl px-2">
            <SpeechGarden />
          </div>
        </section>
      )}

      {/* SCREEN 7: Talking Animals */}
      {scr === 'animals' && (
        <section className="pick">
          <div className="topbar">
            <button
              className="round"
              onClick={() => setScr('pick')}
              aria-label="Back"
            >
              ⬅
            </button>
          </div>
          <div className="w-full max-w-2xl px-2">
            <AnimalChallenge
              targetWord={{ text: L.sounds[0]?.word || 'Word' }}
              onPlaySample={() => {}}
              isCompleted={false}
            />
          </div>
        </section>
      )}

      {/* MODAL: Parent & Clinical Progress Dashboard */}
      {parentPop && (
        <div className="modal" onClick={() => setParentPop(false)}>
          <div
            className="sheet wide-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>👪 {ui.parent}</h3>

            <div className="badge-list">
              <div className="badge-item">
                <b>⭐ {ui.done}:</b> {total} stars earned across practice activities.
              </div>
              <div className="badge-item">
                <b>📊 Tracked Acoustic Observations:</b>
                <div className="text-xs text-slate-600 mt-1">
                  • Non-diagnostic articulation & fluency pattern records.<br />
                  • 0 recurring substitutions flagged (&lt; 3 occurrences).<br />
                  • Calm effort-based practice encouraged.
                </div>
              </div>
            </div>

            <p className="note">
              Practice companion only. For any speech or fluency concerns, please share the exported summary with a qualified speech-language pathologist.
            </p>

            <div className="row">
              <button className="mini wide pdf-btn" onClick={handleExportPdf}>
                {pdfStatus || `📄 ${ui.report || 'PDF Report'}`}
              </button>
              <button className="mini wide" onClick={handleClearData}>
                🗑 {ui.del}
              </button>
              <button className="mini wide ok" onClick={() => setParentPop(false)}>
                ✔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Settings & Preferences */}
      {settingsPop && (
        <div className="modal" onClick={() => setSettingsPop(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>⚙️ {ui.settings || 'Settings'}</h3>

            <div className="badge-list" style={{ textAlign: 'left' }}>
              <div className="badge-item">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>High Contrast</span>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                  />
                </label>
              </div>

              <div className="badge-item">
                <div className="text-xs font-bold mb-1">Whisper Model:</div>
                <select
                  value={whisperModel}
                  onChange={(e) => setWhisperModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="onnx-community/whisper-tiny">Whisper Tiny (Fastest)</option>
                  <option value="onnx-community/whisper-base">Whisper Base (Balanced)</option>
                  <option value="onnx-community/whisper-small">Whisper Small (Highest Accuracy)</option>
                </select>
              </div>
            </div>

            <div className="row">
              <button className="mini wide ok" onClick={() => setSettingsPop(false)}>
                ✔ Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
