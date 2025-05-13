import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChatScreen from '../../components/ChatScreen';

export default function MainChatScreen() {
  return (
    <View style={styles.container}>
      <ChatScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
