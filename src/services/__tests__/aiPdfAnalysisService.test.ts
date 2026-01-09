import { fileToBase64, analyzePDFBook } from '../aiPdfAnalysisService';
import { updateBookAnalysis } from '../booksService';

// Create a mock base64 function
const mockBase64 = jest.fn();

// Mock the File class from expo-file-system/next
jest.mock('expo-file-system/next', () => ({
  File: jest.fn().mockImplementation(() => ({
    base64: mockBase64,
  })),
}));

jest.mock('../booksService', () => ({
  updateBookAnalysis: jest.fn(),
}));

jest.mock('@env', () => ({
  GEMINI_API_KEY: 'test-api-key',
}), { virtual: true });

// Mock global fetch
global.fetch = jest.fn();

describe('aiPdfAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fileToBase64', () => {
    it('should convert file to base64 successfully', async () => {
      mockBase64.mockResolvedValue('base64-content');

      const result = await fileToBase64('test-uri');

      expect(result).toBe('base64-content');
      expect(mockBase64).toHaveBeenCalled();
    });

    it('should throw error when conversion fails', async () => {
      mockBase64.mockRejectedValue(new Error('Read error'));

      await expect(fileToBase64('test-uri')).rejects.toThrow('Failed to read PDF file');
    });
  });

  describe('analyzePDFBook', () => {
    const bookId = 'test-book-id';
    const pdfUri = 'test-uri';
    const bookTitle = 'Test Book';

    it('should analyze PDF and update Firestore on success', async () => {
      // Mock file conversion
      mockBase64.mockResolvedValue('base64-data');

      // Mock fetch success
      const mockAiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    summary: 'Book summary',
                    topics: ['topic1'],
                    themes: ['theme1'],
                    keyPoints: ['point1'],
                  }),
                },
              ],
            },
          },
        ],
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAiResponse),
      });

      await analyzePDFBook(bookId, pdfUri, bookTitle);

      // Wait a bit for background tasks to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify analysis status updates
      expect(updateBookAnalysis).toHaveBeenCalledWith(bookId, expect.objectContaining({
        status: 'analyzing',
      }));

      expect(updateBookAnalysis).toHaveBeenCalledWith(bookId, expect.objectContaining({
        status: 'completed',
        summary: 'Book summary',
        topics: ['topic1'],
        themes: ['theme1'],
        keyPoints: ['point1'],
      }));
    });

    it('should handle API failure and update Firestore with error status', async () => {
      mockBase64.mockResolvedValue('base64-data');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await analyzePDFBook(bookId, pdfUri, bookTitle);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(updateBookAnalysis).toHaveBeenCalledWith(bookId, expect.objectContaining({
        status: 'failed',
        error: expect.stringContaining('500'),
      }));
    });
  });
});
