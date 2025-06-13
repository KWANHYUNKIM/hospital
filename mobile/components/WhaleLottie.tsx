import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface WhaleLottieProps {
  width?: number;
  height?: number;
}

const WhaleLottie: React.FC<WhaleLottieProps> = ({ width = 300, height = 300 }) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.placeholder}>
        <Text style={styles.emoji}>🐋</Text>
        <Text style={styles.text}>고래 애니메이션</Text>
        <Text style={styles.subText}>준비중</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
  },
  placeholder: {
    width: '80%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    opacity: 0.7,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default WhaleLottie; 