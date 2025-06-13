import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TypeScript 인터페이스 정의
interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface AppTourProps {
  autoStart?: boolean;
  onTourComplete?: () => void;
  onTourSkip?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AppTour: React.FC<AppTourProps> = ({ 
  autoStart = true, 
  onTourComplete,
  onTourSkip 
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [visited, setVisited] = useState<boolean>(false);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'header-title',
      title: '환영합니다! 🎉',
      content: '삐뽀삐뽀119 앱에 오신 것을 환영합니다!\n이 투어를 통해 앱의 주요 기능들을 알아보세요.',
      placement: 'bottom',
    },
    {
      id: 'search-bar',
      title: '병원 검색',
      content: '여기서 병원을 검색할 수 있습니다.\n검색어가 없으면 내 주변 검색 기능을 이용해 보세요.',
      placement: 'bottom',
    },
    {
      id: 'main-features',
      title: '주요 기능',
      content: '응급실, 야간진료, 주말진료 등\n다양한 의료 서비스를 찾아볼 수 있습니다.',
      placement: 'top',
    },
    {
      id: 'navigation',
      title: '메뉴 탐색',
      content: '하단 네비게이션을 통해\n병원찾기, 약국찾기, 커뮤니티 등의 기능을 이용하세요.',
      placement: 'top',
    },
    {
      id: 'location-services',
      title: '위치 서비스',
      content: '위치 권한을 허용하면\n더 정확한 주변 병원 정보를 제공받을 수 있습니다.',
      placement: 'bottom',
    },
  ];

  // 방문 여부 확인
  useEffect(() => {
    const checkVisited = async () => {
      try {
        const visitedFlag = await AsyncStorage.getItem('app_tour_visited');
        const hasVisited = visitedFlag === 'true';
        setVisited(hasVisited);
        
        if (autoStart && !hasVisited) {
          setTimeout(() => setIsVisible(true), 1000); // 1초 후 시작
        }
      } catch (error) {
        console.error('방문 여부 확인 오류:', error);
      }
    };

    checkVisited();
  }, [autoStart]);

  // 자동 진행 타이머 설정
  useEffect(() => {
    if (isVisible && currentStep < tourSteps.length) {
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, 4000); // 4초 후 자동 진행
    }

    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [isVisible, currentStep]);

  // 다음 단계
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  // 이전 단계
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 투어 완료
  const completeTour = async () => {
    try {
      await AsyncStorage.setItem('app_tour_visited', 'true');
      setVisited(true);
      setIsVisible(false);
      setCurrentStep(0);
      onTourComplete?.();
    } catch (error) {
      console.error('투어 완료 저장 오류:', error);
    }
  };

  // 투어 건너뛰기
  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('app_tour_visited', 'true');
      setVisited(true);
      setIsVisible(false);
      setCurrentStep(0);
      onTourSkip?.();
    } catch (error) {
      console.error('투어 건너뛰기 저장 오류:', error);
    }
  };

  // 투어 다시 시작
  const restartTour = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  if (!isVisible || visited) {
    return null;
  }

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.7)" barStyle="light-content" />
        
        {/* 배경 오버레이 */}
        <View style={styles.backgroundOverlay} />

        {/* 투어 콘텐츠 */}
        <View style={styles.tourContainer}>
          {/* 진행률 바 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} / {tourSteps.length}
            </Text>
          </View>

          {/* 투어 콘텐츠 */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{currentTourStep.title}</Text>
            <Text style={styles.content}>{currentTourStep.content}</Text>
          </View>

          {/* 네비게이션 버튼 */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>건너뛰기</Text>
            </TouchableOpacity>

            <View style={styles.stepButtons}>
              <TouchableOpacity
                style={[
                  styles.stepButton,
                  currentStep === 0 && styles.stepButtonDisabled
                ]}
                onPress={handlePrevious}
                disabled={currentStep === 0}
              >
                <Text style={styles.stepButtonIcon}>◀</Text>
                <Text style={currentStep === 0 ? styles.stepButtonTextDisabled : styles.stepButtonText}>
                  이전
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === tourSteps.length - 1 ? '완료' : '다음'}
                </Text>
                {currentStep < tourSteps.length - 1 && (
                  <Text style={styles.nextButtonIcon}>▶</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* 단계 표시기 */}
          <View style={styles.stepIndicators}>
            {tourSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepIndicator,
                  index === currentStep && styles.stepIndicatorActive,
                  index < currentStep && styles.stepIndicatorCompleted,
                ]}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tourContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    padding: 24,
    width: screenWidth - 40,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  contentContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  stepButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  stepButtonDisabled: {
    opacity: 0.5,
  },
  stepButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginLeft: 4,
  },
  stepButtonTextDisabled: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginLeft: 4,
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  nextButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepIndicatorActive: {
    backgroundColor: '#4F46E5',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepIndicatorCompleted: {
    backgroundColor: '#10B981',
  },
  stepButtonIcon: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginRight: 4,
  },
  nextButtonIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default AppTour; 