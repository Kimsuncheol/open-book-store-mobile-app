import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Mock Firebase
jest.mock('./src/config/firebase', () => ({
  auth: {},
  db: {},
}));

// Mock expo (to avoid runtime issues)
jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
  useColorScheme: jest.fn(),
}));

// Mock expo-vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
