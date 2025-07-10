import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface DownloadOptions {
  content: string | Blob;
  fileName: string;
  mimeType: string;
  encoding?: 'utf8' | 'base64';
}

export async function downloadFile(options: DownloadOptions): Promise<void> {
  const { content, fileName, mimeType, encoding = 'utf8' } = options;
  
  if (Platform.OS === 'web') {
    try {
      const blob = typeof content === 'string' 
        ? new Blob([content], { type: mimeType })
        : content;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Download initiated: ${fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('エラー', 'ダウンロード中にエラーが発生しました。ブラウザの設定を確認してください。');
      throw error;
    }
  } else {
    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const contentString = typeof content === 'string' ? content : await content.text();
      
      await FileSystem.writeAsStringAsync(fileUri, contentString, {
        encoding: encoding === 'base64' ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8,
      });
      
      console.log(`File saved: ${fileUri}`);
    } catch (error) {
      console.error('File save error:', error);
      Alert.alert('エラー', 'ファイル保存中にエラーが発生しました');
      throw error;
    }
  }
}

export async function downloadHTMLReport(htmlContent: string, fileName: string): Promise<void> {
  await downloadFile({
    content: htmlContent,
    fileName,
    mimeType: 'text/html;charset=utf-8'
  });
}

export async function downloadPDFReport(pdfContent: string, fileName: string): Promise<void> {
  await downloadFile({
    content: pdfContent,
    fileName,
    mimeType: 'application/pdf',
    encoding: 'base64'
  });
}
