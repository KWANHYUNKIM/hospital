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
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { api } from '../../utils/api';

// TypeScript 인터페이스 정의
interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp?: string;
}

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface ServerLog {
  timestamp: string;
  request: {
    message: string;
    location?: string | null;
    coordinates?: LocationCoordinates | null;
  };
  response: string;
}

interface ChatResponse {
  message: string;
}

const Chat: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [location, setLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [serverLogs, setServerLogs] = useState<ServerLog[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<ScrollView>(null);

  // Android 위치 권한 요청
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한 요청',
            message: '병원 검색을 위해 위치 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS는 자동으로 권한 요청
  };

  // 위치 정보 가져오기
  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '위치 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.'
      }]);
      return;
    }

    // 로딩 메시지 표시
    setMessages(prev => [...prev, {
      type: 'bot',
      content: '위치 정보를 가져오는 중입니다...'
    }]);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    Geolocation.getCurrentPosition(
      (position) => {
        const newLocation: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCoordinates(newLocation);
        setLocationPermission('granted');
        
        // 위치 정보를 주소로 변환 (Reverse Geocoding)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.latitude}&lon=${newLocation.longitude}`)
          .then(response => response.json())
          .then(data => {
            setLocation(data.display_name);
            setMessages(prev => [...prev, {
              type: 'bot',
              content: '위치 정보가 성공적으로 가져와졌습니다. 이제 주변 병원을 검색할 수 있습니다.'
            }]);
          })
          .catch(error => {
            console.error('Geocoding error:', error);
            setLocation('위치 정보를 가져왔습니다.');
            setMessages(prev => [...prev, {
              type: 'bot',
              content: '위치 정보를 가져왔습니다. 주변 병원 검색이 가능합니다.'
            }]);
          });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = '위치 정보를 가져오는데 실패했습니다. ';
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage += '위치 정보 접근 권한이 거부되었습니다.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage += '위치 정보를 사용할 수 없습니다.';
            break;
          case 3: // TIMEOUT
            errorMessage += '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
            break;
          default:
            errorMessage += '알 수 없는 오류가 발생했습니다.';
            break;
        }

        setMessages(prev => [...prev, {
          type: 'bot',
          content: errorMessage
        }]);
      },
      options
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post('/api/chat/send', { message: userMessage });
      const data: ChatResponse = response.data;
      const botResponse = data.message;

      // 병원 검색인 경우 위치 정보 확인
      if (botResponse.includes('내 주변 병원 검색 결과') && !coordinates && locationPermission !== 'granted') {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '위치 기반 병원 검색을 위해 위치 정보 접근 권한이 필요합니다. 위치 정보를 허용하시겠습니까?'
        }]);
        
        Alert.alert(
          '위치 권한 요청',
          '주변 병원 검색을 위해 위치 정보가 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '허용', onPress: getLocation }
          ]
        );
        setIsLoading(false);
        return;
      }

      setServerLogs(prev => [...prev, {
        timestamp: new Date().toLocaleString(),
        request: {
          message: userMessage,
          location,
          coordinates
        },
        response: botResponse
      }]);

      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: botResponse,
        timestamp: new Date().toISOString()
      }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: '죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message, index: number) => (
    <View key={index} style={[
      styles.messageContainer,
      message.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer
    ]}>
      {message.type === 'bot' && (
        <View style={styles.botAvatar}>
          <Icon name="smart-toy" size={16} color="#FFFFFF" />
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
          {message.content}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>병원 검색 챗봇</Text>
        <TouchableOpacity 
          style={styles.logButton}
          onPress={() => setShowLogs(!showLogs)}
        >
          <Icon name={showLogs ? "visibility-off" : "visibility"} size={24} color="#6366F1" />
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
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.botMessageContainer]}>
              <View style={styles.botAvatar}>
                <Icon name="smart-toy" size={16} color="#FFFFFF" />
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
              style={styles.locationButton}
              onPress={getLocation}
            >
              <Icon name="my-location" size={20} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Icon name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 서버 로그 */}
      {showLogs && (
        <View style={styles.logsContainer}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>서버 로그</Text>
            <TouchableOpacity onPress={() => setServerLogs([])}>
              <Text style={styles.clearLogsText}>지우기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.logsScrollView} showsVerticalScrollIndicator={false}>
            {serverLogs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                <View style={styles.logContent}>
                  <View style={styles.logSection}>
                    <Text style={styles.logSectionTitle}>요청</Text>
                    <Text style={styles.logText}>{JSON.stringify(log.request, null, 2)}</Text>
                  </View>
                  <View style={styles.logSection}>
                    <Text style={styles.logSectionTitle}>응답</Text>
                    <Text style={styles.logText}>{log.response}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  logButton: {
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
  locationButton: {
    padding: 8,
    marginRight: 4,
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
  logsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    maxHeight: 300,
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  clearLogsText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  logsScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  logContent: {
    gap: 8,
  },
  logSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
  },
  logSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  logText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default Chat; 