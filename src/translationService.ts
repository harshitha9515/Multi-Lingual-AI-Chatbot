const LANGUAGE_CODE_MAP: Record<string, string> = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'iw': 'he',
};

function normalizeLanguageCode(code: string): string {
  return LANGUAGE_CODE_MAP[code] || code;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'auto'
): Promise<string> {
  try {
    const normalizedTarget = normalizeLanguageCode(targetLanguage);
    const normalizedSource = sourceLanguage === 'auto' ? 'auto' : normalizeLanguageCode(sourceLanguage);

    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${normalizedSource}&tl=${normalizedTarget}&dt=t&q=${encodedText}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data[0] && Array.isArray(data[0])) {
      const translatedText = data[0].map((item: any) => item[0]).join('');
      return translatedText;
    }

    const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${normalizedSource === 'auto' ? 'en' : normalizedSource}|${normalizedTarget}`;
    const fallbackResponse = await fetch(fallbackUrl);
    const fallbackData = await fallbackResponse.json();

    if (fallbackData.responseData && fallbackData.responseData.translatedText) {
      return fallbackData.responseData.translatedText;
    }

    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Unable to translate. Please try again.');
  }
}

export async function answerQuestion(question: string, language: string): Promise<string> {
  const responses: Record<string, string[]> = {
    greeting: [
      "Hello! I'm Harshitha's bot. How can I help you today?",
      "Hi there! I'm here to assist you with translations and answer your questions.",
      "Welcome! I'm Harshitha's AI assistant. What can I do for you?"
    ],
    help: [
      "I can translate text into over 100 languages! Just type your text and select a language.",
      "I'm here to help with translations and answer questions. What would you like to know?",
      "You can ask me anything or use me to translate text into different languages!"
    ],
    thanks: [
      "You're welcome! Happy to help!",
      "Glad I could assist you!",
      "Anytime! Feel free to ask more questions."
    ],
    default: [
      "That's an interesting question! I'm primarily focused on translations, but I'll do my best to help.",
      "I'm Harshitha's translation bot. While I specialize in translations, I'm here to assist you!",
      "Great question! Let me help you with that."
    ]
  };

  const lowerQuestion = question.toLowerCase();

  let responseCategory = 'default';
  if (lowerQuestion.match(/\b(hi|hello|hey|greetings)\b/)) {
    responseCategory = 'greeting';
  } else if (lowerQuestion.match(/\b(help|what can you|how do)\b/)) {
    responseCategory = 'help';
  } else if (lowerQuestion.match(/\b(thank|thanks|appreciate)\b/)) {
    responseCategory = 'thanks';
  }

  const categoryResponses = responses[responseCategory];
  const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

  if (language !== 'en') {
    return await translateText(response, language);
  }

  return response;
}
