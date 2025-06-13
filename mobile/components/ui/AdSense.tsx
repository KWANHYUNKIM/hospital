import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AdSenseProps {
  adSlot?: string;
  adFormat?: string;
  style?: any;
}

const AdSense: React.FC<AdSenseProps> = ({ adSlot, adFormat = 'auto', style = {} }) => {
  // 모바일에서는 실제 AdSense 대신 플레이스홀더 표시
  return (
    <View style={[styles.adContainer, style]}>
      <Text style={styles.adText}>광고 영역</Text>
      <Text style={styles.adSubText}>AdSense 광고 플레이스홀더</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  adText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  adSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default AdSense; 