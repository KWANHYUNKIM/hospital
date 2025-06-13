import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import Voice from '@react-native-voice/voice'; // 음성 인식을 위해 필요시 설치
import { api } from '../../utils/api';

// TypeScript 인터페이스 정의
interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface HospitalData {
  hospitals: any[];
}

interface ChatResponse {
  response?: string;
  message?: string;
}

const Message: React.FC<{ message: Message }> = ({ message }) => {
  if (!message || !message.content) return null;

  // HTML 태그를 처리하는 함수 (간단한 변환)
  const processContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1') // **bold** → 일반 텍스트
      .replace(/\*(.*?)\*/g, '$1')     // *italic* → 일반 텍스트
      .replace(/<br\s*\/?>/gi, '\n')  // <br> → 줄바꿈
      .replace(/<[^>]*>/g, '');       // 나머지 HTML 태그 제거
  };

  return (
    <View style={[
      styles.messageContainer,
      message.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer
    ]}>
      {message.type === 'bot' && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
      )}
      <View style={[
        styles.messageContent,
        message.type === 'user' ? styles.userMessage : styles.botMessage
      ]}>
        <Text style={[
          styles.messageText,
          message.type === 'user' ? styles.userMessageText : styles.botMessageText
        ]}>
          {processContent(message.content)}
        </Text>
      </View>
    </View>
  );
};

const BigChatModal: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: '안녕하세요! 검색하고 싶은 지역을 말씀해주시거나, "내 주변"이라고 입력하시면 현재 위치 기준으로 검색해드립니다!'
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const messagesEndRef = useRef<ScrollView>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(true);

  // Mock 위치 정보 가져오기
  const getUserLocation = (): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      // Mock 위치 데이터 (서울시청 좌표)
      setTimeout(() => {
        const coordinates: UserLocation = {
          latitude: 37.5665,
          longitude: 126.9780
        };
        resolve(coordinates);
      }, 1000);
    });
  };

  // 음성 인식 기능 (나중에 구현)
  const toggleListening = () => {
    if (isListening) {
      Alert.alert('알림', '음성 인식 중지');
      setIsListening(false);
    } else {
      Alert.alert('알림', '음성 인식 기능은 준비 중입니다.');
      // Voice API 구현 필요
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMsg }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let coordinates: UserLocation | null = null;
      
      if (userMsg.toLowerCase().includes('내 주변')) {
        try {
          coordinates = await getUserLocation();
          setUserLocation(coordinates);
          
          const locationResponse = await api.post('/api/hospitals/nearby', {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radius: 5000
          });

          if (locationResponse.status === 200) {
            const locationData: HospitalData = locationResponse.data;
            
            const response = await api.post('/api/chat/send', {
              userId: 'test-user',
              message: userMsg,
              hospitals: locationData.hospitals
            });

            if (response.status === 200) {
              const data: ChatResponse = response.data;
              const botMessage = data.response || data.message || '응답을 받지 못했습니다.';
              setMessages(prev => [...prev, { type: 'bot', content: botMessage }]);
              return;
            }
          }
        } catch (locationError) {
          console.error('위치 정보 가져오기 실패:', locationError);
          setMessages(prev => [...prev, { 
            type: 'bot', 
            content: '위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.' 
          }]);
          setIsLoading(false);
          return;
        }
      }

      const response = await api.post('/api/chat/message', {
        message: userMsg,
        location: null,
        coordinates: null
      });

      if (response.status === 200) {
        const data: ChatResponse = response.data;
        const botMessage = data.response || data.message || '응답을 받지 못했습니다.';
        setMessages(prev => [...prev, { type: 'bot', content: botMessage }]);
      }
    } catch (error: any) {
      console.error('Chat API Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: '죄송합니다. 현재 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI 의료 상담</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 채팅 영역 */}
        <View style={styles.chatContainer}>
          <ScrollView
            ref={messagesEndRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            
            {isLoading && (
              <View style={[styles.messageContainer, styles.botMessageContainer]}>
                <View style={styles.botAvatar}>
                  <Text style={styles.botAvatarText}>🤖</Text>
                </View>
                <View style={[styles.messageContent, styles.botMessage]}>
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#6366F1" />
                    <Text style={styles.loadingText}>응답 중...</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* 입력 영역 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="메시지를 입력하세요..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isListening && styles.micButtonActive
                ]}
                onPress={toggleListening}
              >
                <Text style={styles.micButtonText}>
                  {isListening ? "🎤" : "🎙️"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputMessage.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!inputMessage.trim() || isLoading}
              >
                <Text style={styles.sendButtonText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#6366F1',
  },
  botMessage: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#111827',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
    marginRight: 8,
  },
  micButton: {
    padding: 8,
    marginRight: 4,
  },
  micButtonActive: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
  },
  sendButton: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  botAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  micButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  sendButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BigChatModal; 