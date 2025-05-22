import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from '../../components/ThemeProvider';

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    useColorScheme: jest.fn().mockReturnValue('light'),
  };
});

const TestComponent = () => {
  const { isDark, themeMode, setThemeMode } = useTheme();
  return (
    <>
      <Text testID="theme-status">
        {isDark ? 'dark' : 'light'}-{themeMode}
      </Text>
      <Text testID="dark-toggle" onPress={() => setThemeMode('dark')}>
        Set Dark
      </Text>
      <Text testID="light-toggle" onPress={() => setThemeMode('light')}>
        Set Light
      </Text>
      <Text testID="system-toggle" onPress={() => setThemeMode('system')}>
        Set System
      </Text>
    </>
  );
};

describe('ThemeProvider', () => {
  it('provides default theme values', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-status').props.children).toEqual(['light', '-', 'system']);
  });
  
  it('allows changing theme mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    fireEvent.press(screen.getByTestId('dark-toggle'));
    expect(screen.getByTestId('theme-status').props.children).toEqual(['dark', '-', 'dark']);
    
    fireEvent.press(screen.getByTestId('light-toggle'));
    expect(screen.getByTestId('theme-status').props.children).toEqual(['light', '-', 'light']);
    
    fireEvent.press(screen.getByTestId('system-toggle'));
    expect(screen.getByTestId('theme-status').props.children).toEqual(['light', '-', 'system']);
  });
});
