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
      
      console.log(`=== DOWNLOAD DEBUG ===`);
      console.log(`File name: ${fileName}`);
      console.log(`MIME type: ${mimeType}`);
      console.log(`Blob size: ${blob.size} bytes`);
      console.log(`Blob type: ${blob.type}`);
      
      let downloadSuccess = false;
      
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        
        const downloadPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Download timeout'));
          }, 10000);
          
          link.addEventListener('click', () => {
            console.log('Download link clicked successfully');
            clearTimeout(timeout);
            resolve();
          });
        });
        
        link.click();
        await downloadPromise;
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        downloadSuccess = true;
        console.log(`Download method 1 successful: ${fileName}`);
      } catch (method1Error) {
        console.warn('Download method 1 failed:', method1Error);
      }
      
      if (!downloadSuccess) {
        try {
          const url = URL.createObjectURL(blob);
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = url;
          
          document.body.appendChild(iframe);
          
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 3000);
          
          downloadSuccess = true;
          console.log(`Download method 2 (iframe) successful: ${fileName}`);
        } catch (method2Error) {
          console.warn('Download method 2 failed:', method2Error);
          
          try {
            const url = URL.createObjectURL(blob);
            const newWindow = window.open(url, '_blank');
            
            if (newWindow) {
              setTimeout(() => {
                URL.revokeObjectURL(url);
                newWindow.close();
              }, 5000);
              downloadSuccess = true;
              console.log(`Download method 2b (window.open) successful: ${fileName}`);
            } else {
              throw new Error('Popup blocked or window.open failed');
            }
          } catch (method2bError) {
            console.warn('Download method 2b failed:', method2bError);
          }
        }
      }
      
      if (!downloadSuccess && blob.size < 10 * 1024 * 1024) { // 10MB limit
        try {
          const reader = new FileReader();
          const dataUrlPromise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
          });
          
          reader.readAsDataURL(blob);
          const dataUrl = await dataUrlPromise;
          
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = fileName;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          downloadSuccess = true;
          console.log(`Download method 3 successful: ${fileName}`);
        } catch (method3Error) {
          console.warn('Download method 3 failed:', method3Error);
        }
      }
      
      if (!downloadSuccess) {
        throw new Error('All download methods failed');
      }
      
    } catch (error) {
      console.error('Download error:', error);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error('Error details:', {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack
      });
      
      let errorMessage = 'ダウンロード中にエラーが発生しました。';
      if (errorObj.message.includes('timeout')) {
        errorMessage = 'ダウンロードがタイムアウトしました。再試行してください。';
      } else if (errorObj.message.includes('Popup blocked')) {
        errorMessage = 'ポップアップがブロックされました。ブラウザの設定を確認してください。';
      } else if (errorObj.message.includes('All download methods failed')) {
        errorMessage = 'ダウンロードに失敗しました。ブラウザを更新して再試行してください。';
      }
      
      Alert.alert('エラー', errorMessage);
      throw errorObj;
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
