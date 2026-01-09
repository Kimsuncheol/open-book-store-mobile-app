// AI Service using Gemini API
// You can use Firebase AI or direct Gemini API

// import GEMINI_API_KEY from ".env";
import { GEMINI_API_KEY } from "@env";
import { BookAnalysis } from "./booksService";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const conversationCache: Map<string, Message[]> = new Map();
const summaryCache: Map<string, string> = new Map();

export const generateSummary = async (bookId: string, content: string): Promise<string> => {
  if (summaryCache.has(bookId)) {
    return summaryCache.get(bookId)!;
  }

  try {
    const prompt = `Summarize this book content concisely:\n\n${content.substring(0, 8000)}`;
    const result = await callGemini(prompt);
    summaryCache.set(bookId, result);
    return result;
  } catch (error) {
    console.error('AI Summary error:', error);
    throw new Error('Failed to generate summary');
  }
};

export const askQuestion = async (
  bookId: string,
  question: string,
  bookContent: string,
  bookAnalysis?: BookAnalysis
): Promise<string> => {
  const history = conversationCache.get(bookId) || [];
  
  // Build context with analysis if available
  let analysisContext = '';
  if (bookAnalysis && bookAnalysis.status === 'completed') {
    analysisContext = `

Book Analysis:
- Summary: ${bookAnalysis.summary}
- Topics: ${bookAnalysis.topics.join(', ')}
- Themes: ${bookAnalysis.themes.join(', ')}
- Key Points: ${bookAnalysis.keyPoints.join('; ')}`;
  }
  
  const contextPrompt = `Book content:\n${bookContent.substring(0, 4000)}${analysisContext}\n\nPrevious conversation:\n${history.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}\n\nQuestion: ${question}`;
  
  const result = await callGemini(contextPrompt);
  
  history.push({ role: 'user', content: question });
  history.push({ role: 'assistant', content: result });
  conversationCache.set(bookId, history);
  
  return result;
};

const callGemini = async (prompt: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    // Mock response for development
    return 'This is a mock AI response. Add your Gemini API key to enable real AI features.';
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) throw new Error('API request failed');
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
};

export const clearConversation = (bookId: string) => conversationCache.delete(bookId);
export const getConversation = (bookId: string) => conversationCache.get(bookId) || [];
