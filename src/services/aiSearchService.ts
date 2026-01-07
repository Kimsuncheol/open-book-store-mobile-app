import { GEMINI_API_KEY } from '@env';
import { Book } from './firestoreService';

export interface AISearchResult {
  bookId: string;
  score: number;
  reasoning: string;
  book?: Book;
}

/**
 * Search books using AI-powered natural language understanding
 */
export const searchBooksWithAI = async (
  query: string,
  books: Book[]
): Promise<AISearchResult[]> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  if (!query.trim()) {
    return [];
  }

  // Prepare book catalog for AI
  const bookCatalog = books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category || 'General',
    rating: book.rating,
  }));

  const prompt = `You are a book recommendation AI assistant. Given a user's search query and a catalog of available books, analyze the query and recommend the most relevant books.

User Query: "${query}"

Available Books:
${JSON.stringify(bookCatalog, null, 2)}

Task: Analyze the user's query intent and recommend the top 5 most relevant books from the catalog. Consider:
- Title and author matches
- Category relevance
- Natural language understanding (e.g., "mystery novels" → mystery category)
- Thematic relevance
- Book ratings as tiebreakers

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "bookId": "book_id_here",
    "score": 95,
    "reasoning": "Brief explanation why this book matches (max 50 words)"
  }
]

Rules:
- Score must be 0-100 (100 = perfect match)
- Include maximum 5 books
- Only recommend books from the provided catalog
- If no good matches, return empty array []
- Ensure valid JSON format`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = aiResponse.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    const results: AISearchResult[] = JSON.parse(jsonText);

    // Attach full book objects to results
    const enrichedResults = results
      .map((result) => ({
        ...result,
        book: books.find((b) => b.id === result.bookId),
      }))
      .filter((result) => result.book); // Only include results with valid books

    return enrichedResults;
  } catch (error) {
    console.error('AI search error:', error);
    throw error;
  }
};

/**
 * Fallback: Simple text-based search without AI
 */
export const simpleBookSearch = (query: string, books: Book[]): Book[] => {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    return books;
  }

  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.category?.toLowerCase().includes(lowerQuery)
  );
};
