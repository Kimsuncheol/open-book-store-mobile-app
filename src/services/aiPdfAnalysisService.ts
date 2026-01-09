/**
 * AI PDF Analysis Service
 * 
 * Uses Firebase AI (Gemini) to analyze PDF book content in the background.
 * Results are saved to Firestore for use in AI chat and summary features.
 */

import { File } from 'expo-file-system/next';
import { updateBookAnalysis, BookAnalysis } from './booksService';

// Firebase AI imports - using REST API fallback since firebase/ai may not be available
import { GEMINI_API_KEY } from '@env';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Convert a file URI to base64 string
 */
export const fileToBase64 = async (uri: string): Promise<string> => {
  try {
    const file = new File(uri);
    const base64 = await file.base64();
    return base64;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw new Error('Failed to read PDF file');
  }
};

/**
 * Analyze a PDF book using Gemini AI
 * This runs in the background and saves results to Firestore
 */
export const analyzePDFBook = async (
  bookId: string,
  pdfUri: string,
  bookTitle: string
): Promise<void> => {
  // Fire and forget - don't block the caller
  analyzeInBackground(bookId, pdfUri, bookTitle).catch((error) => {
    console.error(`Background PDF analysis failed for book ${bookId}:`, error);
  });
};

/**
 * Internal function to perform the actual analysis
 */
const analyzeInBackground = async (
  bookId: string,
  pdfUri: string,
  bookTitle: string
): Promise<void> => {
  console.log(`Starting PDF analysis for book: ${bookId}`);

  // Mark analysis as in progress
  await updateBookAnalysis(bookId, {
    status: 'analyzing',
    analyzedAt: new Date(),
    summary: '',
    topics: [],
    themes: [],
    keyPoints: [],
  });

  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Convert PDF to base64
    const base64Data = await fileToBase64(pdfUri);

    // Prepare the analysis prompt
    const prompt = `You are analyzing a PDF book titled "${bookTitle}". Please provide a comprehensive analysis with the following structure:

1. SUMMARY: A detailed summary of the book content (200-300 words)
2. TOPICS: Main topics covered in the book (list 5-10 topics)
3. THEMES: Key themes and messages (list 3-5 themes)
4. KEY_POINTS: Important points or takeaways (list 5-10 key points)

Respond ONLY in valid JSON format like this:
{
  "summary": "...",
  "topics": ["topic1", "topic2", ...],
  "themes": ["theme1", "theme2", ...],
  "keyPoints": ["point1", "point2", ...]
}`;

    // Call Gemini API with PDF content
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Handle markdown code blocks if present
      let jsonText = aiResponse.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      analysisResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse analysis result');
    }

    // Save successful analysis to Firestore
    const analysis: BookAnalysis = {
      status: 'completed',
      analyzedAt: new Date(),
      summary: analysisResult.summary || '',
      topics: analysisResult.topics || [],
      themes: analysisResult.themes || [],
      keyPoints: analysisResult.keyPoints || [],
    };

    await updateBookAnalysis(bookId, analysis);
    console.log(`PDF analysis completed for book: ${bookId}`);

  } catch (error) {
    console.error(`PDF analysis error for book ${bookId}:`, error);

    // Save error status to Firestore
    await updateBookAnalysis(bookId, {
      status: 'failed',
      analyzedAt: new Date(),
      summary: '',
      topics: [],
      themes: [],
      keyPoints: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get analysis status for a book
 */
export const getAnalysisStatus = async (bookId: string): Promise<'pending' | 'analyzing' | 'completed' | 'failed'> => {
  // This would typically fetch from Firestore, but we'll rely on the book document
  return 'pending';
};
