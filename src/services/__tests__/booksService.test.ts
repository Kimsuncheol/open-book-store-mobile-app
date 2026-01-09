import { updateBookAnalysis, BookAnalysis } from '../booksService';
import { doc, updateDoc } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  db: {},
}));

describe('booksService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateBookAnalysis', () => {
    it('should call updateDoc with correct arguments', async () => {
      const bookId = 'test-book-id';
      const analysis: BookAnalysis = {
        status: 'completed',
        analyzedAt: new Date(),
        summary: 'Test summary',
        topics: ['topic1'],
        themes: ['theme1'],
        keyPoints: ['point1'],
      };

      const mockDocRef = { id: bookId };
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateBookAnalysis(bookId, analysis);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'books', bookId);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { analyze: analysis });
    });
  });
});
