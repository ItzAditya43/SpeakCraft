/**
 * Language mapping for speech synthesis and recognition
 * Maps browser language codes to supported speech API language codes
 */
const LANGUAGE_MAP = {
  // English variants
  'en': 'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  'en-AU': 'en-AU',
  'en-CA': 'en-CA',
  'en-IN': 'en-IN',
  'en-NZ': 'en-NZ',
  'en-ZA': 'en-ZA',
  
  // Hindi variants
  'hi': 'hi-IN',
  'hi-IN': 'hi-IN',
  
  // Spanish variants
  'es': 'es-ES',
  'es-ES': 'es-ES',
  'es-MX': 'es-MX',
  'es-AR': 'es-AR',
  'es-CO': 'es-CO',
  'es-US': 'es-US',
  
  // French variants
  'fr': 'fr-FR',
  'fr-FR': 'fr-FR',
  'fr-CA': 'fr-CA',
  'fr-BE': 'fr-BE',
  'fr-CH': 'fr-CH',
  
  // German variants
  'de': 'de-DE',
  'de-DE': 'de-DE',
  'de-AT': 'de-AT',
  'de-CH': 'de-CH',
  
  // Italian variants
  'it': 'it-IT',
  'it-IT': 'it-IT',
  'it-CH': 'it-CH',
  
  // Portuguese variants
  'pt': 'pt-PT',
  'pt-PT': 'pt-PT',
  'pt-BR': 'pt-BR',
  
  // Japanese
  'ja': 'ja-JP',
  'ja-JP': 'ja-JP',
  
  // Korean
  'ko': 'ko-KR',
  'ko-KR': 'ko-KR',
  
  // Chinese variants
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-HK',
  
  // Russian
  'ru': 'ru-RU',
  'ru-RU': 'ru-RU',
  
  // Arabic variants
  'ar': 'ar-SA',
  'ar-SA': 'ar-SA',
  'ar-EG': 'ar-EG',
  'ar-AE': 'ar-AE',
  
  // Dutch variants
  'nl': 'nl-NL',
  'nl-NL': 'nl-NL',
  'nl-BE': 'nl-BE',
  
  // Swedish
  'sv': 'sv-SE',
  'sv-SE': 'sv-SE',
  
  // Norwegian
  'no': 'no-NO',
  'nb': 'nb-NO',
  'nn': 'nn-NO',
  
  // Danish
  'da': 'da-DK',
  'da-DK': 'da-DK',
  
  // Finnish
  'fi': 'fi-FI',
  'fi-FI': 'fi-FI',
  
  // Polish
  'pl': 'pl-PL',
  'pl-PL': 'pl-PL',
  
  // Turkish
  'tr': 'tr-TR',
  'tr-TR': 'tr-TR',
  
  // Hebrew
  'he': 'he-IL',
  'he-IL': 'he-IL',
  
  // Thai
  'th': 'th-TH',
  'th-TH': 'th-TH',
  
  // Vietnamese
  'vi': 'vi-VN',
  'vi-VN': 'vi-VN',
  
  // Indonesian
  'id': 'id-ID',
  'id-ID': 'id-ID',
  
  // Malay
  'ms': 'ms-MY',
  'ms-MY': 'ms-MY',
  
  // Tamil
  'ta': 'ta-IN',
  'ta-IN': 'ta-IN',
  
  // Telugu
  'te': 'te-IN',
  'te-IN': 'te-IN',
  
  // Bengali
  'bn': 'bn-IN',
  'bn-IN': 'bn-IN',
  'bn-BD': 'bn-BD',
  
  // Gujarati
  'gu': 'gu-IN',
  'gu-IN': 'gu-IN',
  
  // Marathi
  'mr': 'mr-IN',
  'mr-IN': 'mr-IN',
  
  // Punjabi
  'pa': 'pa-IN',
  'pa-IN': 'pa-IN',
  
  // Urdu
  'ur': 'ur-PK',
  'ur-PK': 'ur-PK',
  'ur-IN': 'ur-IN'
};

/**
 * Gets the user's preferred browser language
 * @returns {string} - Browser language code (e.g., 'en-US', 'hi-IN')
 */
export function getBrowserLang() {
  // Try to get the most specific language preference
  const languages = [
    navigator.language,
    ...(navigator.languages || []),
    navigator.userLanguage, // IE fallback
    navigator.browserLanguage, // IE fallback
    navigator.systemLanguage, // IE fallback
    'en-US' // Ultimate fallback
  ].filter(Boolean);

  // Return the first language we find in our map
  for (const lang of languages) {
    if (LANGUAGE_MAP[lang]) {
      return LANGUAGE_MAP[lang];
    }
    
    // Try without region code (e.g., 'en-GB' -> 'en')
    const langCode = lang.split('-')[0];
    if (LANGUAGE_MAP[langCode]) {
      return LANGUAGE_MAP[langCode];
    }
  }

  // Default fallback
  return 'en-US';
}

/**
 * Maps a language code to a supported speech API language code
 * @param {string} langCode - Input language code
 * @returns {string} - Mapped language code for speech APIs
 */
export function mapLanguageCode(langCode) {
  if (!langCode) return 'en-US';
  
  // Direct match
  if (LANGUAGE_MAP[langCode]) {
    return LANGUAGE_MAP[langCode];
  }
  
  // Try without region code
  const baseLang = langCode.split('-')[0];
  if (LANGUAGE_MAP[baseLang]) {
    return LANGUAGE_MAP[baseLang];
  }
  
  // Fallback to English
  return 'en-US';
}

/**
 * Gets all supported language codes
 * @returns {Array} - Array of supported language codes
 */
export function getSupportedLanguages() {
  return Object.values(LANGUAGE_MAP);
}

/**
 * Gets language display name from code
 * @param {string} langCode - Language code (e.g., 'en-US')
 * @returns {string} - Display name (e.g., 'English (United States)')
 */
export function getLanguageDisplayName(langCode) {
  try {
    const displayNames = new Intl.DisplayNames([langCode], { type: 'language' });
    return displayNames.of(langCode) || langCode;
  } catch (error) {
    // Fallback for older browsers
    const languageNames = {
      'en-US': 'English (United States)',
      'en-GB': 'English (United Kingdom)',
      'en-IN': 'English (India)',
      'hi-IN': 'Hindi (India)',
      'es-ES': 'Spanish (Spain)',
      'es-MX': 'Spanish (Mexico)',
      'fr-FR': 'French (France)',
      'de-DE': 'German (Germany)',
      'it-IT': 'Italian (Italy)',
      'pt-BR': 'Portuguese (Brazil)',
      'ja-JP': 'Japanese (Japan)',
      'ko-KR': 'Korean (South Korea)',
      'zh-CN': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)',
      'ru-RU': 'Russian (Russia)',
      'ar-SA': 'Arabic (Saudi Arabia)'
    };
    
    return languageNames[langCode] || langCode;
  }
}