import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { FileUp } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { readFileAsBase64, getMimeTypeFromFileName } from '../utils/fileUpload';

interface FileUploadButtonProps {
  onFileSelected: (fileData: {
    name: string;
    content: string;
    type: string;
  }) => void;
  style?: any;
  isDark?: boolean;
}

export function FileUploadButton({ onFileSelected, style, isDark = false }: FileUploadButtonProps) {
  const handlePress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      const file = result.assets[0];
      
      const fileContent = await readFileAsBase64(file.uri);
      
      const fileType = file.mimeType || getMimeTypeFromFileName(file.name);
      
      onFileSelected({
        name: file.name,
        content: fileContent,
        type: fileType,
      });
    } catch (error) {
      console.error('Error picking file:', error);
      throw error;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isDark ? '#0A84FF' : '#007AFF' },
        style
      ]}
      onPress={handlePress}
    >
      <FileUp size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
