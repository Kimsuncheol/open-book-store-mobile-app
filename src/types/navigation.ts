import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ResetPassword: undefined;
};

// Dashboard Stack - screens accessible from Dashboard tab
export type DashboardStackParamList = {
  DashboardMain: undefined;
  BookList: { category?: string };
  BookDetails: { bookId: string };
  AISummary: { bookId: string; title: string };
  AIAsk: { bookId?: string; title?: string } | undefined;
  WriteReview: { bookId: string; bookTitle: string };
  BookReviews: { bookId: string; bookTitle: string };
  Polls: undefined;
  Trending: undefined;
  Upload: undefined;
};

// Downloads Stack - screens accessible from Downloads tab
export type DownloadsStackParamList = {
  DownloadsMain: undefined;
};

// Profile Stack - screens accessible from Profile tab
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Account: undefined;
  Downloads: undefined;
  Subscription: undefined;
  SubscriptionBilling: undefined;
};

// AIAsk Stack - screens accessible from AIAsk tab
export type AIAskStackParamList = {
  AIAskMain: { bookId?: string; title?: string } | undefined;
};

// Cart Stack - screens accessible from Cart tab
export type SavedStackParamList = {
  SavedMain: undefined;
};

// Bottom Tab Navigator
export type BottomTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
  AIAskTab: NavigatorScreenParams<AIAskStackParamList>;
  SaveTab: NavigatorScreenParams<SavedStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<BottomTabParamList>;
};

// =============================================================================
// Screen Props - Auth
// =============================================================================
export type SignInScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;
export type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;
export type ResetPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

// =============================================================================
// Screen Props - Dashboard Stack
// =============================================================================
export type DashboardScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'DashboardMain'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type BookListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'BookList'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type BookDetailsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'BookDetails'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type AISummaryScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'AISummary'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type WriteReviewScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'WriteReview'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type BookReviewsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'BookReviews'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type PollsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'Polls'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type TrendingScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'Trending'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type UploadScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'Upload'>,
  BottomTabScreenProps<BottomTabParamList>
>;


// =============================================================================
// Screen Props - Downloads (now part of Profile Stack)
// =============================================================================
export type DownloadsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Downloads'>,
  BottomTabScreenProps<BottomTabParamList>
>;

// =============================================================================
// Screen Props - Profile Stack
// =============================================================================
export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Settings'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type AccountScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Account'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type SubscriptionScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Subscription'>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type SubscriptionBillingScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'SubscriptionBilling'>,
  BottomTabScreenProps<BottomTabParamList>
>;

// =============================================================================
// Screen Props - AIAsk Stack
// =============================================================================
export type AIAskScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AIAskStackParamList, 'AIAskMain'>,
  BottomTabScreenProps<BottomTabParamList>
>;

// =============================================================================
// Screen Props - Cart Stack
// =============================================================================
export type SavedScreenProps = CompositeScreenProps<
  NativeStackScreenProps<SavedStackParamList, 'SavedMain'>,
  BottomTabScreenProps<BottomTabParamList>
>;
