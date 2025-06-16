/**
 * Speaks the given text using the browser's SpeechSynthesis API
 * @param {string} text - The text to speak
 * @param {string} lang - The language code (e.g., 'en-US', 'hi-IN')
 * @param {Object} options - Additional options for speech synthesis
 * @returns {Promise} - Promise that resolves when speech is complete
 */
export function speak(text, lang = 'en-US', options = {}) {
  return new Promise((resolve, reject) => {
    // Check if SpeechSynthesis is supported
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported in this browser'));
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Create a new SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    utterance.lang = lang;
    
    // Apply options with defaults
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Event handlers
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };
    
    utterance.onstart = () => {
      console.log('Speech started');
    };
    
    // Get available voices and try to find a matching one
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(voice => voice.lang === lang);
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    } else {
      // Fallback to first voice that matches the language prefix
      const langPrefix = lang.split('-')[0];
      const fallbackVoice = voices.find(voice => voice.lang.startsWith(langPrefix));
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Gets all available voices for speech synthesis
 * @returns {Array} - Array of available SpeechSynthesisVoice objects
 */
export function getAvailableVoices() {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Stops any ongoing speech synthesis
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if speech synthesis is currently speaking
 * @returns {boolean} - True if currently speaking
 */
export function isSpeaking() {
  if (!('speechSynthesis' in window)) {
    return false;
  }
  return window.speechSynthesis.speaking;
}