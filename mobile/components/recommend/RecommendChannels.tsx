import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from 'react-native';

// 타입 정의
export interface SocialLink {
  name: string;
  url: string;
  img: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/',
    img: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/',
    img: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
  },
  // 필요시 더 추가 가능
];

const RecommendChannels: React.FC = () => {
  const handleLinkPress = async (link: SocialLink) => {
    try {
      const supported = await Linking.canOpenURL(link.url);
      if (supported) {
        await Linking.openURL(link.url);
      } else {
        Alert.alert('오류', `${link.name} 링크를 열 수 없습니다.`);
      }
    } catch (error) {
      console.error('링크 열기 오류:', error);
      Alert.alert('오류', '링크를 여는 중 오류가 발생했습니다.');
    }
  };

  const renderSocialLink = (link: SocialLink, index: number) => (
    <TouchableOpacity
      key={link.name}
      style={styles.linkButton}
      onPress={() => handleLinkPress(link)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: link.img }}
        style={styles.linkImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>추천 채널</Text>
      <View style={styles.linksContainer}>
        {socialLinks.map((link, index) => renderSocialLink(link, index))}
      </View>
      <Text style={styles.subtitle}>팔로우/구독하고 좋아요도 눌러주세요!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  linksContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  linkButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  linkImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default RecommendChannels; 