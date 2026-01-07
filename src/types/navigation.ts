import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ResetPassword: undefined;
};

export type MainStackParamList = {
  // Common screens
  Dashboard: undefined;
  BookList: { category?: string };
  BookDetails: { bookId: string };
  Profile: undefined;
  Settings: undefined;
  Billing: { bookId: string; bookTitle: string; price: number };
  Downloads: undefined;
  Cart: undefined;
  PDFViewer: { bookId: string; title: string; filePath: string };
  AISummary: { bookId: string; title: string };
  AIAsk: { bookId: string; title: string };
  // User screens
  WriteReview: { bookId: string; bookTitle: string };
  BookReviews: { bookId: string; bookTitle: string };
  Polls: undefined;
  // Seller screens
  Upload: undefined;
  SellerDashboard: undefined;
  MyBooks: undefined;
  SalesReport: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Screen Props
export type SignInScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;
export type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;
export type ResetPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

// Main Screen Props
export type DashboardScreenProps = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;
export type BookListScreenProps = NativeStackScreenProps<MainStackParamList, 'BookList'>;
export type BookDetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'BookDetails'>;
export type ProfileScreenProps = NativeStackScreenProps<MainStackParamList, 'Profile'>;
export type SettingsScreenProps = NativeStackScreenProps<MainStackParamList, 'Settings'>;
export type BillingScreenProps = NativeStackScreenProps<MainStackParamList, 'Billing'>;
export type DownloadsScreenProps = NativeStackScreenProps<MainStackParamList, 'Downloads'>;
export type PDFViewerScreenProps = NativeStackScreenProps<MainStackParamList, 'PDFViewer'>;
export type AISummaryScreenProps = NativeStackScreenProps<MainStackParamList, 'AISummary'>;
export type AIAskScreenProps = NativeStackScreenProps<MainStackParamList, 'AIAsk'>;

// User Feature Props
export type WriteReviewScreenProps = NativeStackScreenProps<MainStackParamList, 'WriteReview'>;
export type BookReviewsScreenProps = NativeStackScreenProps<MainStackParamList, 'BookReviews'>;
export type PollsScreenProps = NativeStackScreenProps<MainStackParamList, 'Polls'>;
export type CartScreenProps = NativeStackScreenProps<MainStackParamList, 'Cart'>;

// Seller Screen Props
export type UploadScreenProps = NativeStackScreenProps<MainStackParamList, 'Upload'>;
export type SellerDashboardScreenProps = NativeStackScreenProps<MainStackParamList, 'SellerDashboard'>;
export type MyBooksScreenProps = NativeStackScreenProps<MainStackParamList, 'MyBooks'>;
export type SalesReportScreenProps = NativeStackScreenProps<MainStackParamList, 'SalesReport'>;
