import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smile,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { MascotBuddy } from './MascotBuddy'
import { useCompanionVoice } from '../hooks/useCompanionVoice'
import { companionVoice } from '../services/companionVoice'

export function ResultScreen({ whisperHook, micHook }) {
  const { t } = useTranslation()
  const {
    lastResult,
    soundPack,
    currentLanguage,
    selectedSoundId,
    selectedWordIndex,
    setSelectedSound,
    setScreen,
  } = useAppStore()

  const [mascotType, setMascotType] = useState('robot') // 'robot' | 'elephant'
  const { isSpeaking, speakCurrentScreen } = useCompanionVoice()

  const sounds = soundPack?.sounds || []
  const currentSound = sounds.find((s) => s.id === selectedSoundId) || sounds[0] || { symbol: 'ഴ' }
  const currentWords = currentSound?.words || []
  const currentWord = currentWords[selectedWordIndex] || currentWords[0] || { text: 'mazha' }

  const isSuccess = Boolean(lastResult?.isSuccess)
  const starsAwarded = lastResult?.starsAwarded ?? (isSuccess ? 3 : 1)
  const targetWord = lastResult?.targetWord || currentWord?.text || ''

  // Speak encouraging retry voice if the word was not spoken correctly
  useEffect(() => {
    if (!isSuccess) {
      const retryPrompts = {
        ml: 'സാരമില്ല കൂട്ടുകാരാ! നന്നായി ശ്രമിച്ചു! ഒന്നുകൂടി ശ്രദ്ധിച്ചു കേട്ട് പതുക്കെ പറയൂ!',
        hi: 'कोई बात नहीं! अच्छा प्रयास! ध्यान से सुनो और एक बार फिर बोलो!',
        en: 'Good try! Listen carefully and let us practice one more time!',
      }
      const prompt = retryPrompts[currentLanguage] || retryPrompts.en
      companionVoice.speak(prompt, currentLanguage, true)
    }
  }, [isSuccess, currentLanguage])

  const handleRetry = () => {
    micHook?.clearRecordedAudio?.()
    setScreen('practice')
  }

  const handleNextSound = () => {
    micHook?.clearRecordedAudio?.()
    if (selectedWordIndex + 1 < currentWords.length) {
      useAppStore.getState().setSelectedWordIndex(selectedWordIndex + 1)
    } else {
      const currentIdx = sounds.findIndex((s) => s.id === selectedSoundId)
      const nextIdx = (currentIdx + 1) % sounds.length
      setSelectedSound(sounds[nextIdx].id, 0)
    }
    setScreen('practice')
  }

  const handlePlaySample = () => {
    if (whisperHook?.playSampleAudio) {
      whisperHook.playSampleAudio(targetWord, currentLanguage)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Result & Reward Card matching Mockup Screen 4 */}
      <div className={`bg-gradient-to-b ${isSuccess ? 'from-sky-50 via-white to-sky-50 border-sky-100' : 'from-amber-50 via-white to-amber-50 border-amber-200'} rounded-3xl p-6 sm:p-10 border-4 shadow-xl text-center relative overflow-hidden`}>
        {/* Graphical accents */}
        {isSuccess ? (
          <>
            <div className="absolute top-4 left-6 text-3xl animate-pulse opacity-80">🎉</div>
            <div className="absolute top-6 right-8 text-4xl animate-bounce opacity-80">🎆</div>
            <div className="absolute bottom-6 right-10 text-2xl animate-spin opacity-50" style={{ animationDuration: '6s' }}>✨</div>
          </>
        ) : (
          <>
            <div className="absolute top-4 left-6 text-3xl opacity-80">🌱</div>
            <div className="absolute top-6 right-8 text-3xl opacity-80">💫</div>
          </>
        )}

        {/* Golden Stars */}
        <div className="flex items-center justify-center gap-3 mb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-5xl sm:text-6xl transition-transform duration-500 ${
                i < starsAwarded
                  ? 'scale-110 drop-shadow-[0_0_16px_#F59E0B] animate-gentle-bounce'
                  : 'opacity-30 scale-90'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className={`text-4xl sm:text-5xl font-black font-fredoka tracking-tight mb-6 ${isSuccess ? 'text-purple-600' : 'text-amber-600'}`}>
          {isSuccess
            ? (currentLanguage === 'ml' ? 'ഗംഭീരം കൂട്ടുകാരാ!' : currentLanguage === 'hi' ? 'शाबाश दोस्तों!' : 'Great Job!')
            : (currentLanguage === 'ml' ? 'നന്നായി ശ്രമിച്ചു! ഒന്നുകൂടി പറയാം!' : currentLanguage === 'hi' ? 'अच्छा प्रयास! एक बार फिर बोलो!' : 'Good Try! Let’s Practice Again!')}
        </h2>

        {/* Mascot + Speech Feedback Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-2xl mx-auto mb-8">
          {/* Left: Mascot Character */}
          <div className="flex flex-col items-center">
            {/* Mascot Dialogue Bubble */}
            <div
              onClick={() => {
                if (isSuccess) speakCurrentScreen('result')
                else {
                  const retryPrompts = {
                    ml: 'സാരമില്ല കൂട്ടുകാരാ! നന്നായി ശ്രമിച്ചു! ഒന്നുകൂടി ശ്രദ്ധിച്ചു കേട്ട് പതുക്കെ പറയൂ!',
                    hi: 'कोई बात नहीं! अच्छा प्रयास! ध्यान से सुनो और एक बार फिर बोलो!',
                    en: 'Good try! Listen carefully and let us practice one more time!',
                  }
                  companionVoice.speak(retryPrompts[currentLanguage] || retryPrompts.en, currentLanguage, true)
                }
              }}
              title="Click to hear companion voice"
              className="bg-white px-4 py-2.5 rounded-2xl border-2 border-sky-200 shadow-sm text-xs sm:text-sm font-bold text-slate-700 mb-2 relative cursor-pointer hover:border-sky-300 transition-all flex items-center gap-1.5"
            >
              <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isSpeaking ? 'text-pink-500 animate-bounce' : 'text-sky-600'}`} />
              <span>
                {isSuccess
                  ? (currentLanguage === 'ml' ? 'വളരെ നന്നായി! നിങ്ങൾ മനോഹരമായി പറഞ്ഞു!' : currentLanguage === 'hi' ? 'बहुत बढ़िया! आपने बहुत अच्छा बोला!' : 'Wonderful! You said it very well!')
                  : (currentLanguage === 'ml' ? 'സാരമില്ല കൂട്ടുകാരാ! ഒന്നുകൂടി ശ്രദ്ധിച്ചു കേട്ട് പതുക്കെ പറയൂ!' : currentLanguage === 'hi' ? 'कोई बात नहीं! ध्यान से सुनो और धीरे से बोलो!' : 'Keep going! Listen carefully and try one more time!')}
              </span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-white" />
            </div>
            <MascotBuddy
              type={mascotType}
              mood={isSpeaking ? 'talking' : isSuccess ? 'celebrating' : 'encouraging'}
              size={120}
              onClick={() => {
                if (isSuccess) speakCurrentScreen('result')
                else {
                  const retryPrompts = {
                    ml: 'സാരമില്ല കൂട്ടുകാരാ! നന്നായി ശ്രമിച്ചു! ഒന്നുകൂടി ശ്രദ്ധിച്ചു കേട്ട് പതുക്കെ പറയൂ!',
                    hi: 'कोई बात नहीं! अच्छा प्रयास! ध्यान से सुनो और एक बार फिर बोलो!',
                    en: 'Good try! Listen carefully and let us practice one more time!',
                  }
                  companionVoice.speak(retryPrompts[currentLanguage] || retryPrompts.en, currentLanguage, true)
                }
              }}
            />
            {/* Mascot switch button */}
            <button
              onClick={() => setMascotType(mascotType === 'robot' ? 'elephant' : 'robot')}
              className="mt-2 text-[11px] font-extrabold text-sky-600 hover:text-sky-800 underline cursor-pointer"
            >
              {mascotType === 'robot' ? '🐘 Switch to Aana Teacher' : '🤖 Switch to Robot Buddy'}
            </button>
          </div>

          {/* Center: Target Sound Card with illustration */}
          <div className="bg-white rounded-3xl p-5 border-2 border-sky-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-4xl mb-1 shadow-inner">
              {currentWord.icon || '🌧️'}
            </div>
            <div className="text-3xl font-black text-slate-900 font-fredoka">
              {currentSound.symbol}
            </div>
            <div className="text-sm font-bold text-slate-500">
              ({currentWord.text})
            </div>
          </div>

          {/* Right: Checklist Items */}
          <div className="flex flex-col items-start gap-3 bg-white p-5 rounded-3xl border-2 border-sky-100 shadow-sm">
            <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-800">
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{currentLanguage === 'ml' ? 'ശബ്ദം കൃത്യമായി പറഞ്ഞു!' : currentLanguage === 'hi' ? 'ध्वनि सही बोली!' : 'Sound matched!'}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>{currentLanguage === 'ml' ? 'ശബ്ദം ഒന്നുകൂടി ശ്രദ്ധിക്കൂ' : currentLanguage === 'hi' ? 'आवाज़ दोबारा ध्यान से सुनें' : 'Listen closely to the sound'}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-800">
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{currentLanguage === 'ml' ? 'ചുണ്ടുകൾ ഭംഗിയായി അനക്കി!' : currentLanguage === 'hi' ? 'होंठों का आकार बहुत अच्छा!' : 'Nice mouth shape!'}</span>
                </>
              ) : (
                <>
                  <Smile className="w-5 h-5 text-sky-500 shrink-0" />
                  <span>{currentLanguage === 'ml' ? 'ചുണ്ടുകൾ കൂടുതൽ തുറന്ന് പറയൂ' : currentLanguage === 'hi' ? 'मुँह थोड़ा और खोलकर बोलें' : 'Open mouth and say gently'}</span>
                </>
              )}
            </div>
            <button
              onClick={handlePlaySample}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1.5 mt-1 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>{currentLanguage === 'ml' ? 'വീണ്ടും കേൾക്കാം' : currentLanguage === 'hi' ? 'फिर से सुनें' : 'Listen again'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons matching Mockup Screen 4 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          {/* Purple Retry Button */}
          <button
            onClick={handleRetry}
            className="w-full sm:w-1/2 py-3.5 px-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{currentLanguage === 'ml' ? 'വീണ്ടും ശ്രമിക്കാം' : currentLanguage === 'hi' ? 'फिर से कोशिश करें' : 'Retry'}</span>
          </button>

          {/* Blue Next Sound Button */}
          <button
            onClick={handleNextSound}
            className="w-full sm:w-1/2 py-3.5 px-6 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow-md shadow-sky-200 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <span>{currentLanguage === 'ml' ? 'അടുത്ത അക്ഷരം' : currentLanguage === 'hi' ? 'अगला शब्द' : 'Next Sound'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
