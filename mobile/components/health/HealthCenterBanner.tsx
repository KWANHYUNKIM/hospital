import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// TypeScript 인터페이스 정의
interface HealthService {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface HealthCenterBannerProps {
  onPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const HealthCenterBanner: React.FC<HealthCenterBannerProps> = ({ onPress }) => {
  const navigation = useNavigation();

  const healthServices: HealthService[] = [
    {
      id: 1,
      icon: '💚',
      title: '건강관리',
      description: '만성질환 관리, 영양 상담, 운동 처방'
    },
    {
      id: 2,
      icon: '🧠',
      title: '정신건강',
      description: '상담, 치료, 재활 프로그램 운영'
    },
    {
      id: 3,
      icon: '🤝',
      title: '복지서비스',
      description: '맞춤형 복지 서비스 제공 및 연계'
    },
    {
      id: 4,
      icon: '🏥',
      title: '지역연계',
      description: '보건소, 의료기관과의 협력 체계'
    }
  ];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('HealthCenterList' as never);
    }
  };

  const renderServiceCard = (service: HealthService, index: number) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceIcon}>{service.icon}</Text>
        <Text style={styles.serviceTitle}>{service.title}</Text>
      </View>
      <Text style={styles.serviceDescription}>{service.description}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#14B8A6', '#3B82F6']} // teal-500 to blue-500
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>건강증진센터 & 정신건강복지센터</Text>
          <Text style={styles.subtitle}>
            국민건강증진법 및 정신건강복지법에 따른 전문 의료복지 서비스
          </Text>
        </View>

        {/* 서비스 카드 그리드 */}
        <View style={styles.servicesGrid}>
          {healthServices.map((service, index) => renderServiceCard(service, index))}
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actionSection}>
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>자세히 보기</Text>
            <Text style={styles.actionButtonIcon}>→</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceCard: {
    width: (screenWidth - 72) / 2, // 전체 너비에서 여백과 간격 제외
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backdropFilter: 'blur(10px)',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 16,
  },
  actionSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default HealthCenterBanner; 