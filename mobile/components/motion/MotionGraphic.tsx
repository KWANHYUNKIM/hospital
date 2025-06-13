import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MotionGraphicProps {
  style?: any;
}

const MotionGraphic: React.FC<MotionGraphicProps> = ({ style }) => {
  // TODO: 실제 애니메이션 라이브러리(예: react-native-reanimated, Lottie) 사용
  return (
    <View style={[styles.container, style]}>
      <View style={styles.animationContainer}>
        <Text style={styles.emoji}>🏥</Text>
        <Text style={styles.text}>모션 그래픽</Text>
        <Text style={styles.subText}>애니메이션 준비중</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(13, 153, 255, 0.1)',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d99ff',
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default MotionGraphic; 