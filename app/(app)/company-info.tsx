import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CompanyInfoManager } from '../../components/CompanyInfoManager';
import { AuthWrapper } from '../../components/AuthWrapper';

export default function CompanyInfoScreen() {
  return (
    <AuthWrapper requiredRole="admin">
      <View style={styles.container}>
        <CompanyInfoManager />
      </View>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
