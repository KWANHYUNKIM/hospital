import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import MotionGraphic from './motion/MotionGraphic';

const DownloadSection = () => {
  const handleDownload = (platform: 'ios' | 'android') => {
    // TODO: 실제 앱스토어 링크로 교체
    const urls = {
      ios: 'https://apps.apple.com/kr/app/id1234567890',
      android: 'https://play.google.com/store/apps/details?id=com.bippobippo.hospital'
    };
    
    Linking.openURL(urls[platform]);
  };

  const handleComingSoon = () => {
    // 앱 출시 예정 안내
    console.log('앱 출시 예정');
  };

  return (
    <View style={styles.container}>
      {/* 왼쪽 정보 영역 */}
      <View style={styles.infoSection}>
        <Text style={styles.title}>
          나만의 스마트한 앱{'\n'}
          <Text style={styles.highlight}>
            삐뽀삐뽀119로{'\n'}
            일상을 바꿔보세요.
          </Text>
        </Text>
        
        <Text style={styles.description}>
          더 가볍고, 더 편하게, 내 일상에 딱 맞는 앱이 여기 있습니다.{'\n'}
          새로운 건강정보와 서비스를 경험해보세요.{'\n'}
          작지만 큰 변화가 시작됩니다.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleComingSoon}>
          <Text style={styles.buttonIcon}>🚀</Text>
          <Text style={styles.buttonText}>앱 출시 예정</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* 오른쪽 비주얼 영역 */}
      <View style={styles.visualSection}>
        <View style={styles.motionContainer}>
          <MotionGraphic style={styles.motionGraphic} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
    backgroundColor: '#f3f9ff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 5,
    marginVertical: 16,
  },
  infoSection: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1a2638',
  },
  highlight: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    color: '#0d99ff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475269',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 32,
    shadowColor: '#0d99ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0d99ff',
    marginRight: 12,
  },
  buttonArrow: {
    fontSize: 20,
    color: '#0d99ff',
    fontWeight: 'bold',
  },
  visualSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  motionGraphic: {
    width: 200,
    height: 200,
  },
});

export default DownloadSection; 