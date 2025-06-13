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
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../utils/api';

// TypeScript 인터페이스 정의
interface Message {
  id: string;
  type: 'user' | 'jarvis';
  content: string;
  timestamp: string;
}

interface JarvisResponse {
  message?: string;
  response?: string;
  data?: any;
}

const Jarvis: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'jarvis',
      content: '안녕하세요! 저는 JARVIS입니다. 의료 관련 질문이나 병원 정보에 대해 도움을 드릴 수 있습니다. 무엇을 도와드릴까요?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // JARVIS 펄스 애니메이션
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (isTyping) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
      pulseAnim.setValue(1);
    }

    return () => pulseAnimation.stop();
  }, [isTyping, pulseAnim]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: generateMessageId(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // JARVIS API 호출 (실제 구현 시 적절한 엔드포인트로 변경)
      const response = await api.post('/api/jarvis/chat', {
        message: userMessage.content,
        context: messages.slice(-5) // 최근 5개 메시지를 컨텍스트로 전송
      });

      const data: JarvisResponse = response.data;
      const jarvisResponse = data.message || data.response || 'JARVIS가 응답할 수 없습니다.';

      // 타이핑 효과를 위한 지연
      setTimeout(() => {
        const jarvisMessage: Message = {
          id: generateMessageId(),
          type: 'jarvis',
          content: jarvisResponse,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, jarvisMessage]);
        setIsTyping(false);
      }, 1500);

    } catch (error: any) {
      console.error('JARVIS API Error:', error);
      
      setTimeout(() => {
        const errorMessage: Message = {
          id: generateMessageId(),
          type: 'jarvis',
          content: '죄송합니다. 현재 시스템에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    Alert.alert(
      '대화 초기화',
      '모든 대화 내용을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: generateMessageId(),
                type: 'jarvis',
                content: '대화가 초기화되었습니다. 새롭게 시작해보세요!',
                timestamp: new Date().toISOString()
              }
            ]);
          }
        }
      ]
    );
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.type === 'user' ? styles.userMessageContainer : styles.jarvisMessageContainer
    ]}>
      {message.type === 'jarvis' && (
        <Animated.View style={[
          styles.jarvisAvatar,
          { transform: [{ scale: isTyping ? pulseAnim : 1 }] }
        ]}>
          <Icon name="psychology" size={20} color="#FFFFFF" />
        </Animated.View>
      )}
      <View style={[
        styles.messageContent,
        message.type === 'user' ? styles.userMessage : styles.jarvisMessage
      ]}>
        <Text style={[
          styles.messageText,
          message.type === 'user' ? styles.userMessageText : styles.jarvisMessageText
        ]}>
          {message.content}
        </Text>
        <Text style={[
          styles.timestamp,
          message.type === 'user' ? styles.userTimestamp : styles.jarvisTimestamp
        ]}>
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.jarvisHeaderAvatar}>
            <Icon name="psychology" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>JARVIS</Text>
            <Text style={styles.headerSubtitle}>AI Medical Assistant</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={clearConversation}>
          <Icon name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 채팅 영역 */}
      <View style={styles.chatContainer}>
        <ScrollView
          ref={messagesEndRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.jarvisMessageContainer]}>
              <Animated.View style={[
                styles.jarvisAvatar,
                { transform: [{ scale: pulseAnim }] }
              ]}>
                <Icon name="psychology" size={20} color="#FFFFFF" />
              </Animated.View>
              <View style={[styles.messageContent, styles.jarvisMessage]}>
                <View style={styles.typingIndicator}>
                  <Text style={styles.typingText}>JARVIS가 입력 중</Text>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                  </View>
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
              placeholder="JARVIS에게 메시지 보내기..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jarvisHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  clearButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
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
  jarvisMessageContainer: {
    justifyContent: 'flex-start',
  },
  jarvisAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageContent: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#3B82F6',
  },
  jarvisMessage: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  jarvisMessageText: {
    color: '#F1F5F9',
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#E2E8F0',
    textAlign: 'right',
  },
  jarvisTimestamp: {
    color: '#94A3B8',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
    marginHorizontal: 1,
  },
  dot1: {
    // 애니메이션은 나중에 추가 가능
  },
  dot2: {
    // 애니메이션은 나중에 추가 가능
  },
  dot3: {
    // 애니메이션은 나중에 추가 가능
  },
  inputContainer: {
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#F1F5F9',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#475569',
  },
});

export default Jarvis; 