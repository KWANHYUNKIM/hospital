import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NursingHospitalBanner: React.FC = () => {
  const navigation = useNavigation();

  const handleViewMore = () => {
    navigation.navigate('NursingHospitals' as never);
  };

  return (
    <View style={styles.container}>
      {/* 상단 이미지 섹션 */}
      <View style={styles.headerSection}>
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏥</Text>
          </View>
          <Text style={styles.headerLabel}>요양병원 둘러보기</Text>
          <Text style={styles.headerTitle}>시설을 둘러보세요</Text>
          <Text style={styles.headerDescription}>
            최고의 요양병원을 찾아보세요
          </Text>
        </View>
      </View>

      {/* 시설 정보 섹션 */}
      <View style={styles.content}>
        {/* 시설 특징 */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>⏰</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>24시간 케어</Text>
              <Text style={styles.featureDescription}>전문의 상시 대기</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🛡️</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>안전한 시설</Text>
              <Text style={styles.featureDescription}>현대식 의료 장비</Text>
            </View>
          </View>
        </View>

        {/* 시설 둘러보기 버튼 */}
        <TouchableOpacity 
          style={styles.viewMoreButton}
          onPress={handleViewMore}
          activeOpacity={0.8}
        >
          <Text style={styles.viewMoreButtonText}>자세히 알아보기</Text>
          <Text style={styles.viewMoreArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  headerSection: {
    height: 128,
    backgroundColor: '#3B82F6',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
  },
  headerLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  featuresContainer: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
  },
  featureIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#3B82F6',
  },
  viewMoreButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  viewMoreArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NursingHospitalBanner; 