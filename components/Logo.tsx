import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from './ThemeProvider';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export function Logo({ size = 'medium' }: LogoProps) {
  const { isDark } = useTheme();
  
  const logoSize = {
    small: 30,
    medium: 40,
    large: 60,
  }[size];

  return (
    <View style={[styles.container, { width: logoSize, height: logoSize }]}>
      <Image
        source={require('../assets/images/AIB.webp')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
