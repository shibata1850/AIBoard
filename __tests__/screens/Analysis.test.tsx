import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AnalysisPage from '../../app/(app)/analysis';
import { FileUploadButton } from '../../components/FileUploadButton';
import { analyzeDocument } from '../../utils/gemini';
import { extractTextFromPdf } from '../../utils/pdfUtils';

jest.mock('../../components/AuthWrapper', () => ({
  AuthWrapper: ({ children }) => children,
}));

jest.mock('../../components/ThemeProvider', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('../../components/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}));

jest.mock('../../components/FileUploadButton', () => ({
  FileUploadButton: jest.fn().mockImplementation(({ onFileSelected }) => (
    <button
      data-testid="file-upload-button"
      onClick={() => onFileSelected({
        name: 'test.pdf',
        content: 'base64content',
        type: 'application/pdf',
      })}
    >
      Upload File
    </button>
  )),
}));

jest.mock('../../utils/gemini', () => ({
  analyzeDocument: jest.fn().mockImplementation(() => Promise.resolve('Mocked analysis result')),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
}));

describe('AnalysisPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the analysis page correctly', () => {
    render(<AnalysisPage />);
    
    expect(screen.getByText('経営資料分析')).toBeTruthy();
    expect(screen.getByText('資料の種類を選択')).toBeTruthy();
    expect(screen.getByText('財務諸表')).toBeTruthy();
    expect(screen.getByText('ファイルをアップロードして分析')).toBeTruthy();
    expect(screen.getByTestId('file-upload-button')).toBeTruthy();
  });

  it('processes uploaded PDF file correctly', async () => {
    render(<AnalysisPage />);
    
    fireEvent.press(screen.getByTestId('file-upload-button'));
    
    await waitFor(() => {
      expect(extractTextFromPdf).toHaveBeenCalledWith('base64content');
    });
    
    await waitFor(() => {
      expect(analyzeDocument).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf の分析結果')).toBeTruthy();
      expect(screen.getByText('Mocked analysis result')).toBeTruthy();
    });
  });

  it('allows selecting different document types', () => {
    render(<AnalysisPage />);
    
    fireEvent.press(screen.getByText('貸借対照表'));
    expect(screen.getByText('貸借対照表')).toHaveStyle({ backgroundColor: '#007AFF' });
    
    fireEvent.press(screen.getByText('損益計算書'));
    expect(screen.getByText('損益計算書')).toHaveStyle({ backgroundColor: '#007AFF' });
  });

  it('shows the new analysis button after analysis', async () => {
    render(<AnalysisPage />);
    
    fireEvent.press(screen.getByTestId('file-upload-button'));
    
    await waitFor(() => {
      expect(screen.getByText('新しい分析')).toBeTruthy();
    });
    
    fireEvent.press(screen.getByText('新しい分析'));
    
    await waitFor(() => {
      expect(screen.queryByText('test.pdf の分析結果')).toBeNull();
      expect(screen.getByText('ファイルをアップロードして分析')).toBeTruthy();
    });
  });
});
