import '@testing-library/jest-dom';
import { NativeModules as RNNativeModules } from 'react-native';

jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      supabaseUrl: 'https://mock-supabase-url.supabase.co',
      supabaseAnonKey: 'mock-anon-key',
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('./utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: {}, subscription: { unsubscribe: jest.fn() } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: jest.fn().mockImplementation(() => Promise.resolve({
        response: {
          text: jest.fn().mockReturnValue('Mocked analysis result'),
        },
      })),
    })),
  })),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockImplementation(() => Promise.resolve({
    type: 'success',
    name: 'test.pdf',
    uri: 'file:///path/to/test.pdf',
    mimeType: 'application/pdf',
  })),
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockImplementation(() => Promise.resolve('base64content')),
  getInfoAsync: jest.fn().mockImplementation(() => Promise.resolve({ size: 1024 })),
  documentDirectory: 'file:///document/directory/',
  cacheDirectory: 'file:///cache/directory/',
}));

jest.mock('./utils/pdfUtils', () => ({
  extractTextFromPdf: jest.fn().mockImplementation(() => Promise.resolve('Extracted text from PDF')),
  isPdfFile: jest.fn().mockImplementation((type) => type === 'application/pdf'),
  processPdfWithGemini: jest.fn().mockImplementation(() => Promise.resolve('PDF analysis result')),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
}));

global.__reanimatedWorkletInit = jest.fn();

RNNativeModules.UIManager = RNNativeModules.UIManager || {};
RNNativeModules.UIManager.RCTView = RNNativeModules.UIManager.RCTView || {};
RNNativeModules.RNGestureHandlerModule = RNNativeModules.RNGestureHandlerModule || {
  State: { BEGAN: 'BEGAN', FAILED: 'FAILED', ACTIVE: 'ACTIVE', END: 'END' },
  attachGestureHandler: jest.fn(),
  createGestureHandler: jest.fn(),
  dropGestureHandler: jest.fn(),
  updateGestureHandler: jest.fn(),
};

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  blob: () => Promise.resolve(new Blob()),
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
}));
