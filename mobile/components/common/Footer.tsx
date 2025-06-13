import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TypeScript 인터페이스 정의
interface SocialLink {
  url: string;
  label: string;
  icon: string;
  color: string;
}

const Footer: React.FC = () => {
  // 외부 링크 열기 함수
  const openLink = async (url: string, label: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', `${label} 링크를 열 수 없습니다.`);
      }
    } catch (error) {
      console.error('Link opening error:', error);
      Alert.alert('오류', '링크를 여는 중 오류가 발생했습니다.');
    }
  };

  // 소셜 미디어 링크 데이터
  const socialLinks: SocialLink[] = [
    {
      url: 'https://blog.naver.com/bippobippo119',
      label: '네이버 블로그',
      icon: 'public',
      color: '#03C75A'
    },
    {
      url: 'https://www.instagram.com/bippobippo119/',
      label: '인스타그램',
      icon: 'photo-camera',
      color: '#E1306C'
    },
    {
      url: 'https://github.com/KWANHYUNKIM',
      label: '깃허브',
      icon: 'code',
      color: '#181717'
    }
  ];

  // 소셜 버튼 렌더링
  const renderSocialButton = (social: SocialLink, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.socialButton, { backgroundColor: social.color }]}
      onPress={() => openLink(social.url, social.label)}
      accessibilityLabel={social.label}
    >
      <Icon name={social.icon} size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        {/* 회사 소개 */}
        <View style={styles.section}>
          <Text style={styles.title}>🚑 삐뽀삐뽀119</Text>
          <Text style={styles.description}>
            가장 가까운 병원을 빠르게 찾을 수 있도록!{'\n'}
            <Text style={styles.boldText}>삐뽀삐뽀119</Text>는 공공데이터를 활용하여 실시간 병원 정보를 제공합니다.{'\n'}
            빠르고, 정확한 의료정보 검색을 경험하세요.
          </Text>
        </View>

        {/* 주요 서비스 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 주요 서비스</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {/* 회사 소개 페이지로 이동 */}}
          >
            <Text style={styles.linkText}>회사 소개</Text>
          </TouchableOpacity>
        </View>

        {/* 소셜 미디어 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 소셜 미디어</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map(renderSocialButton)}
          </View>
        </View>

        {/* 공공누리 저작권 & 데이터 출처 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ 저작권 & 데이터 출처</Text>
          <Text style={styles.dataSourceText}>
            본 서비스는{' '}
            <Text
              style={styles.linkInline}
              onPress={() => openLink('https://www.data.go.kr/', '공공데이터포털')}
            >
              공공데이터포털
            </Text>
            의 정보를 활용하여 운영됩니다.
          </Text>
          <Text style={styles.copyrightText}>
            <Text
              style={styles.linkInline}
              onPress={() => openLink('https://www.kogl.or.kr/', '공공누리')}
            >
              공공누리 제1유형
            </Text>
            {' '}적용
          </Text>
        </View>
      </View>

      {/* 하단 바 */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>
          © 2024 삐뽀삐뽀119. 모든 권리 보유.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#111827',
    paddingVertical: 32,
    marginTop: 40,
  },
  container: {
    paddingHorizontal: 16,
    gap: 24,
  },
  section: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dataSourceText: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  linkInline: {
    textDecorationLine: 'underline',
    color: '#60A5FA',
  },
  bottomBar: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default Footer; 