import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';

// TypeScript 인터페이스 정의
interface MenuItem {
  path: string;
  label: string;
  icon?: string;
}

interface NavigationBarProps {
  hideOnScroll?: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ hideOnScroll = false }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, userProfileImage, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  // 현재 경로가 특정 경로와 일치하는지 확인하는 함수
  const isActive = (path: string): boolean => {
    return route.name?.startsWith(path.replace('/', '')) || false;
  };

  // 랜덤 색상 생성 함수
  const getRandomColor = (username: string): string => {
    const colors = [
      '#EF4444', '#EC4899', '#8B5CF6', '#6366F1', 
      '#3B82F6', '#06B6D4', '#10B981', '#84CC16',
      '#EAB308', '#F97316'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // 사용자 이니셜 가져오기
  const getInitials = (username: string): string => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  const menuItems: MenuItem[] = [
    { path: '/hospitals', label: '병원 찾기', icon: 'local-hospital' },
    { path: '/pharmacies', label: '약국 찾기', icon: 'local-pharmacy' },
    { path: '/community', label: '커뮤니티', icon: 'forum' },
    { path: '/map', label: '지도', icon: 'map' },
    { path: '/news', label: '소식', icon: 'article' },
  ];

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    const screenName = path.replace('/', '');
    navigation.navigate(screenName as never);
  };

  const handleUserAction = (action: 'profile' | 'logout') => {
    setIsUserMenuOpen(false);
    
    if (action === 'profile') {
      navigation.navigate('Profile' as never);
    } else if (action === 'logout') {
      logout();
    }
  };

  const handleLogin = () => {
    setIsMenuOpen(false);
    navigation.navigate('Login' as never);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          {/* 로고 */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => navigation.navigate('Main' as never)}
          >
            <Text style={styles.logo}>삐뽀삐뽀119</Text>
          </TouchableOpacity>

          {/* 햄버거 메뉴 버튼 */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
          >
            <Icon name="menu" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 메인 메뉴 모달 */}
      <Modal
        visible={isMenuOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>메뉴</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsMenuOpen(false)}
            >
              <Icon name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuContent}>
            {/* 메뉴 항목들 */}
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.path}
                style={[
                  styles.menuItem,
                  isActive(item.path) && styles.menuItemActive
                ]}
                onPress={() => handleNavigate(item.path)}
              >
                {item.icon && (
                  <Icon
                    name={item.icon}
                    size={24}
                    color={isActive(item.path) ? '#4F46E5' : '#6B7280'}
                    style={styles.menuIcon}
                  />
                )}
                <Text style={[
                  styles.menuItemText,
                  isActive(item.path) && styles.menuItemTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* 사용자 정보 섹션 */}
            <View style={styles.userSection}>
              {user ? (
                <>
                  <View style={styles.userInfo}>
                    {userProfileImage ? (
                      <Image
                        source={{ uri: userProfileImage }}
                        style={styles.userImage}
                      />
                    ) : (
                      <View style={[
                        styles.userInitials,
                        { backgroundColor: getRandomColor(user.username) }
                      ]}>
                        <Text style={styles.userInitialsText}>
                          {getInitials(user.username)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.username}>{user.username}</Text>
                      {user.email && (
                        <Text style={styles.userEmail}>{user.email}</Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleUserAction('profile')}
                  >
                    <Icon name="person" size={24} color="#6B7280" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>프로필</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleUserAction('logout')}
                  >
                    <Icon name="logout" size={24} color="#6B7280" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>로그아웃</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                >
                  <Text style={styles.loginButtonText}>로그인</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  navbar: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  menuButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  menuContent: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemActive: {
    backgroundColor: '#F0F9FF',
    borderRightWidth: 3,
    borderRightColor: '#4F46E5',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  userSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInitialsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NavigationBar; 