// Companion voice prompts and Web Speech API synthesis service with authentic multi-language voice delivery

export const COMPANION_PROMPTS = {
  welcome: {
    ml: 'നമസ്കാരം കൂട്ടുകാരെ! വോക്കാസൈറ്റ് കിഡ്സിലേക്ക് സ്വാഗതം! ഞാൻ നിങ്ങളുടെ സ്പീച്ച് ട്യൂട്ടർ ആണ്. നമുക്ക് ഒന്നിച്ച് സംസാരിച്ചു തുടങ്ങാം!',
    mlPhonetic: 'Namaskaaram koottukaare! VocaSight Kids-ilekku swaagatham! Njaan ningalude speech tutor aanu. Nammukku samsaarichu thudangaam!',
    hi: 'नमस्ते दोस्तों! वोकासाईट किड्स में आपका स्वागत है! मैं आपका ट्यूटर हूँ। चलो बोलना शुरू करें!',
    hiPhonetic: 'Namaste dosto! VocaSight Kids mein aapka swaagat hai! Main aapka speech tutor hoon. Chalo bolna shuru karein!',
    en: "Hello friends! Welcome to VocaSight Kids! I am your speech tutor. Let's make speech practice fun!",
    enPhonetic: "Hello friends! Welcome to VocaSight Kids! I am your speech tutor. Let's make speech practice fun!",
  },
  'sound-select': {
    ml: 'ഒരു അക്ഷരം തിരഞ്ഞെടുക്കൂ! മഴ, ഇല, കര എന്നിവയിൽ നിന്ന് ഒരെണ്ണം തിരഞ്ഞെടുത്ത് നമുക്ക് പരിശീലിക്കാം!',
    mlPhonetic: 'Oru aksharam thiranjedukkoo! Mazha, ila, kara ennivayil ninnu orennam thiranjedukkoo!',
    hi: 'एक ध्वनि चुनें! अभ्यास करने के लिए किसी भी कार्ड पर टैप करें!',
    hiPhonetic: 'Ek dhwani chuniye! Abhyaas karne ke liye kisi bhi card par tap karein!',
    en: 'Choose a sound to practice! Tap any card to begin your sound quest!',
    enPhonetic: 'Choose a sound to practice! Tap any card to begin your sound quest!',
  },
  practice: {
    ml: 'എന്നെപ്പോലെ പറയൂ! ദീർഘശ്വാസമെടുത്ത് പതുക്കെ സംസാരിക്കൂ. റെഡ് മൈക്ക് അമർത്തി പറയൂ!',
    mlPhonetic: 'Enneppole parayoo! Dheerghashwaasam eduthu pathukke samsaarikkoo. Red mike amarthee parayoo!',
    hi: 'मेरी तरह बोलो! गहरी सांस लो और धीरे-धीरे बोलो। लाल माइक दबाकर बोलो!',
    hiPhonetic: 'Meri tarah boliye! Gehri saans lijiye aur dheere se boliye. Red mic daba kar boliye!',
    en: 'Say it like me! Take a deep breath and speak slowly. Tap the red mic to speak!',
    enPhonetic: 'Say it like me! Take a deep breath and speak slowly. Tap the red mic to speak!',
  },
  result: {
    ml: 'വളരെ നന്നായി! നിങ്ങൾ മനോഹരമായി പറഞ്ഞു! ഗ്രേറ്റ് ജോബ്! അടുത്ത അക്ഷരത്തിലേക്ക് പോകാം!',
    mlPhonetic: 'Valare nannaayi! Ningal manoharamaayi paranju! Great job! Adutha shabdathilekku pokaam!',
    hi: 'बहुत बढ़िया! आपने बहुत अच्छा बोला! शाबाश! अगले शब्द पर चलें!',
    hiPhonetic: 'Bahut badhiya! Aapne bahut accha bola! Agle shabd par chalein!',
    en: 'Wonderful! You said it very well! Great job! Let us move to the next sound!',
    enPhonetic: 'Wonderful! You said it very well! Great job! Let us move to the next sound!',
  },
  parent: {
    ml: 'നിങ്ങളുടെ പരിശീലന പുരോഗതിയും പൂന്തോട്ടവും ഇവിടെ കാണാം! ദിവസവും പരിശീലിക്കൂ!',
    mlPhonetic: 'Ningalude parisheelana purogathiyum poonthottavum ivide kaanaam! Divasavum parisheelikkoo!',
    hi: 'यहाँ आपकी अभ्यास प्रगति और बगीचा है! रोज अभ्यास करें!',
    hiPhonetic: 'Yahan aapki speech progress aur bagicha hai! Har din abhyaas karein!',
    en: 'Here is your speech progress and blooming garden! Keep up the daily streak!',
    enPhonetic: 'Here is your speech progress and blooming garden! Keep up the daily streak!',
  },
  settings: {
    ml: 'ഇവിടെ നിങ്ങൾക്ക് ഭാഷയും ക്രമീകരണങ്ങളും ശബ്ദവും മാറ്റാം!',
    mlPhonetic: 'Ivide ningalkku bhaashayum settingsum shabdavum maattaam!',
    hi: 'यहाँ आप भाषा, गति और आवाज बदल सकते हैं!',
    hiPhonetic: 'Yahan aap bhasha, speed aur voice settings badal sakte hain!',
    en: 'Here you can adjust your language, pacing speed, and voice settings!',
    enPhonetic: 'Here you can adjust your language, pacing speed, and voice settings!',
  },
  quest: {
    ml: 'ശബ്ദങ്ങളുടെ വഴിയിലൂടെ ഒരു മാന്ത്രിക യാത്ര പോകാം! ഓരോ ലെവലും പൂർത്തിയാക്കൂ!',
    mlPhonetic: 'Nammukku shabdangalude vazhiyiloode oru maanthrika yaathra pokaam! Oro levelum poorthiyaakkoo!',
    hi: 'चलो जादुई रास्ते पर चलें! हर स्तर पूरा करें!',
    hiPhonetic: 'Chalo jaadui raaste par chalein! Har level poora karein!',
    en: "Let's go on a sound quest adventure! Complete every stage on the map!",
    enPhonetic: "Let's go on a sound quest adventure! Complete every stage on the map!",
  },
  garden: {
    ml: 'നിങ്ങളുടെ സ്പീച്ച് പൂന്തോട്ടത്തിലേക്ക് സ്വാഗതം! വെള്ളമൊഴിച്ച് മനോഹരമായ പൂക്കൾ വിരിയിക്കൂ!',
    mlPhonetic: 'Ningalude speech poonthottathilekku swaagatham! Vellamozhichu manoharamaaya pookkal viriyikkoo!',
    hi: 'अपने बोलने के बगीचे में स्वागत है! पानी देकर सुंदर फूल खिलाएं!',
    hiPhonetic: 'Apne bolne ke bagiche mein swaagat hai! Paani dekar sundar phool khilayein!',
    en: 'Welcome to your speech garden! Tap the water drops to blossom flowers!',
    enPhonetic: 'Welcome to your speech garden! Tap the water drops to blossom flowers!',
  },
}

// Common word dictionary to ensure speech synthesis correctly pronounces words in Malayalam
export const WORD_PHONETICS = {
  'മഴ': 'Mazha',
  'ഇല': 'Ila',
  'കര': 'Kara',
  'പഴം': 'Pazham',
  'വഴി': 'Vazhi',
  'കിളി': 'Kili',
  'കളി': 'Kali',
  'വള': 'Vala',
  'മറ': 'Mara',
  'പറ': 'Para',
  'പറവ': 'Parava',
  'കുറുക്കൻ': 'Kurukkan',
  'മുറം': 'Muram',
  'നല്ലത്': 'Nallathu',
  'അമ്മ': 'Amma',
  'ആന': 'Aana',
  'പൂച്ച': 'Poocha',
  'കാറ്റ്': 'Kaattu',
  'വെള്ളം': 'Vellam',
}

// Generate friendly tutor speech when a word comes up
export function getWordPrompt(wordText, langCode = 'ml') {
  if (!wordText) return ''
  const cleanWord = wordText.trim()
  if (langCode === 'ml') {
    return `${cleanWord}! എന്നെപ്പോലെ പറയൂ: ${cleanWord}!`
  } else if (langCode === 'ta') {
    return `${cleanWord}! என்னைப்போல் சொல்லுங்கள்: ${cleanWord}!`
  } else if (langCode === 'te') {
    return `${cleanWord}! నాలాగే చెప్పండి: ${cleanWord}!`
  } else if (langCode === 'kn') {
    return `${cleanWord}! ನನ್ನಂತೆ ಹೇಳಿ: ${cleanWord}!`
  } else if (langCode === 'hi') {
    return `${cleanWord}! मेरी तरह बोलो: ${cleanWord}!`
  }
  return `${cleanWord}! Say it like me: ${cleanWord}!`
}

class CompanionVoiceService {
  constructor() {
    this.isSpeaking = false
    this.currentUtterance = null
    this.listeners = new Set()

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded/updated
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.isSpeaking))
  }

  playMicChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
      const notes = [587.33, 880] // D5 -> A5 upbeat mic on-air chime
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1)
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.28)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + 0.32)
      })
    } catch (_) {}
  }

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    this.isSpeaking = false
    this.notify()
  }

  speak(text, langCode = 'ml', withChime = true, phoneticFallback = null) {
    if (!('speechSynthesis' in window) || !text) return

    try {
      if (withChime) {
        this.playMicChime()
      }

      window.speechSynthesis.cancel()
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }

      const voices = window.speechSynthesis.getVoices() || []
      let chosenVoice = null
      let spokenText = text
      let spokenLang = 'en-US'

      // Check for voice matching the exact language (e.g. ml-IN, hi-IN)
      const nativeMatch = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langCode.toLowerCase())
      )

      if (nativeMatch) {
        chosenVoice = nativeMatch
        spokenLang = nativeMatch.lang
        spokenText = text
      } else {
        // When local OS does not have a dedicated ml voice pack,
        // use an Indian accent voice (en-IN or hi-IN) and phonetic Malayalam text
        const indianMatch = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('en-in') ||
            v.lang.toLowerCase().includes('hi')
        )
        const defaultMatch = voices.find((v) => v.default) || voices[0]
        chosenVoice = indianMatch || defaultMatch || null
        spokenLang = chosenVoice ? chosenVoice.lang : 'en-US'

        // If a word is in our dictionary or phonetic fallback exists, use it
        const dictWord = WORD_PHONETICS[text.trim()]
        spokenText = dictWord || phoneticFallback || text
      }

      const utterance = new SpeechSynthesisUtterance(spokenText)
      utterance.volume = 1.0
      utterance.pitch = 1.15
      utterance.rate = 0.90
      utterance.lang = spokenLang
      if (chosenVoice) {
        utterance.voice = chosenVoice
      }

      utterance.onstart = () => {
        this.isSpeaking = true
        this.notify()
      }

      utterance.onend = () => {
        this.isSpeaking = false
        this.notify()
      }

      utterance.onerror = (err) => {
        console.warn('TTS utterance error:', err)
        this.isSpeaking = false
        this.notify()
      }

      this.currentUtterance = utterance
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('Companion speech synthesis error:', err)
      this.isSpeaking = false
      this.notify()
    }
  }

  speakScreen(screenName, langCode = 'ml', withChime = true) {
    const screenPrompts = COMPANION_PROMPTS[screenName] || COMPANION_PROMPTS.welcome
    const text = screenPrompts[langCode] || screenPrompts.en
    const phoneticKey = `${langCode}Phonetic`
    const phoneticFallback = screenPrompts[phoneticKey] || text

    this.speak(text, langCode, withChime, phoneticFallback)
    return text
  }

  speakWord(wordText, langCode = 'ml', translit = null) {
    if (!wordText) return
    const cleanWord = wordText.trim()
    const phoneticWord = translit || WORD_PHONETICS[cleanWord] || cleanWord

    let prompt = cleanWord
    let phoneticPrompt = phoneticWord

    if (langCode === 'ml') {
      prompt = `${cleanWord}! എന്നെപ്പോലെ പറയൂ: ${cleanWord}!`
      phoneticPrompt = `${phoneticWord}! Enneppole parayoo: ${phoneticWord}!`
    } else if (langCode === 'ta') {
      prompt = `${cleanWord}! என்னைப்போல் சொல்லுங்கள்: ${cleanWord}!`
      phoneticPrompt = `${phoneticWord}! Ennaippol sollungal: ${phoneticWord}!`
    } else if (langCode === 'te') {
      prompt = `${cleanWord}! నాలాగే చెప్పండి: ${cleanWord}!`
      phoneticPrompt = `${phoneticWord}! Naalaage cheppandi: ${phoneticWord}!`
    } else if (langCode === 'kn') {
      prompt = `${cleanWord}! ನನ್ನಂತೆ ಹೇಳಿ: ${cleanWord}!`
      phoneticPrompt = `${phoneticWord}! Nannanthe heli: ${phoneticWord}!`
    } else if (langCode === 'hi') {
      prompt = `${cleanWord}! मेरी तरह बोलो: ${cleanWord}!`
      phoneticPrompt = `${phoneticWord}! Meri tarah bolo: ${phoneticWord}!`
    } else {
      prompt = `${cleanWord}! Say it like me: ${cleanWord}!`
      phoneticPrompt = `${phoneticWord}! Say it like me: ${phoneticWord}!`
    }

    this.speak(prompt, langCode, true, phoneticPrompt)
    return prompt
  }
}

export const companionVoice = new CompanionVoiceService()
