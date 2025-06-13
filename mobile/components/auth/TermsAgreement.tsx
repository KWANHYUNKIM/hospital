import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TypeScript 인터페이스 정의
interface TermsChecked {
  required: boolean;
  privacy: boolean;
  location: boolean;
  marketing: boolean;
}

interface ScrollProgress {
  required: number;
  privacy: number;
  location: number;
  marketing: number;
}

type TermKey = keyof TermsChecked;

const TermsAgreement: React.FC = () => {
  const navigation = useNavigation();
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [termsChecked, setTermsChecked] = useState<TermsChecked>({
    required: false,
    privacy: false,
    location: false,
    marketing: false
  });
  const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
    required: 0,
    privacy: 0,
    location: 0,
    marketing: 0
  });

  const termsRefs = {
    required: useRef<ScrollView>(null),
    privacy: useRef<ScrollView>(null),
    location: useRef<ScrollView>(null),
    marketing: useRef<ScrollView>(null)
  };

  const handleAllCheck = (checked: boolean) => {
    setAllChecked(checked);
    setTermsChecked({
      required: checked,
      privacy: checked,
      location: checked,
      marketing: checked
    });
  };

  const handleIndividualCheck = (term: TermKey) => {
    const newChecked = {
      ...termsChecked,
      [term]: !termsChecked[term]
    };
    setTermsChecked(newChecked);
    
    const allTermsChecked = Object.values(newChecked).every(value => value);
    setAllChecked(allTermsChecked);
  };

  const handleScroll = (term: TermKey, event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    setScrollProgress(prev => ({
      ...prev,
      [term]: clampedProgress
    }));

    // 스크롤이 90% 이상 되면 자동으로 체크
    if (clampedProgress >= 90 && !termsChecked[term]) {
      handleIndividualCheck(term);
    }
  };

  const handleNext = () => {
    if (termsChecked.required && termsChecked.privacy) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Register',
          params: {
            termsAgreed: {
              required: termsChecked.required,
              privacy: termsChecked.privacy,
              location: termsChecked.location,
              marketing: termsChecked.marketing
            }
          }
        })
      );
    } else {
      Alert.alert('알림', '필수 약관에 동의해주세요.');
    }
  };

  const handleCancel = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  const termsContent = {
    required: `제1조 (목적)
이 약관은 호로스코프(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 모든 서비스를 말합니다.
2. "이용자"란 회사의 서비스를 이용하는 회원을 말합니다.

제3조 (약관의 효력 및 변경)
1. 이 약관은 서비스를 이용하는 모든 이용자에 대하여 그 효력을 발생합니다.
2. 회사는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 웹사이트에 공지함으로써 효력이 발생합니다.

제4조 (서비스의 제공 및 변경)
1. 회사는 다음과 같은 업무를 수행합니다.
   - 병원 정보 제공 서비스
   - 응급실 실시간 정보 서비스
   - 의료진 상담 서비스
2. 회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 현재의 서비스의 내용을 게시한 곳에 즉시 공지합니다.`,
    
    privacy: `제1조 (개인정보의 수집 및 이용목적)
회사는 다음의 목적을 위하여 개인정보를 수집 및 이용합니다:
1. 서비스 제공 및 운영
2. 서비스 이용에 따른 본인확인
3. 서비스 이용에 따른 통지
4. 서비스 이용에 따른 불만처리

제2조 (수집하는 개인정보 항목)
회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
1. 필수항목: 아이디, 비밀번호, 이메일 주소
2. 선택항목: 전화번호, 주소

제3조 (개인정보의 보유 및 이용기간)
회사는 이용자의 개인정보를 원칙적으로 서비스 이용계약의 성립 시부터 서비스 이용계약의 해지 시까지 보관합니다.

제4조 (개인정보의 파기)
회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.`,
    
    location: `제1조 (위치기반서비스의 이용)
회사는 이용자의 위치정보를 이용하여 다음과 같은 서비스를 제공합니다:
1. 주변 병원 검색
2. 응급실 위치 표시
3. 야간 진료소 위치 표시

제2조 (위치정보의 수집 및 이용)
1. 회사는 이용자의 위치정보를 수집하여 서비스 제공에 이용합니다.
2. 이용자는 위치정보 수집에 대한 동의를 거부할 수 있습니다.

제3조 (위치정보의 보호)
회사는 이용자의 위치정보를 안전하게 보호하기 위해 보안시스템을 갖추고 있습니다.

제4조 (위치정보의 제3자 제공)
회사는 이용자의 동의 없이 위치정보를 제3자에게 제공하지 않습니다.`,
    
    marketing: `제1조 (마케팅 정보 수신 동의)
회사는 이용자에게 다음과 같은 마케팅 정보를 제공합니다:
1. 새로운 서비스 안내
2. 이벤트 및 프로모션 안내
3. 맞춤형 서비스 추천

제2조 (마케팅 정보 수신 방법)
회사는 이용자가 동의한 방법으로 마케팅 정보를 제공합니다:
1. 이메일
2. SMS
3. 푸시 알림

제3조 (마케팅 정보 수신 동의 철회)
이용자는 언제든지 마케팅 정보 수신 동의를 철회할 수 있습니다.

제4조 (마케팅 정보의 보관)
회사는 마케팅 정보 수신에 동의한 이용자의 정보를 별도로 보관하며, 동의 철회 시 즉시 삭제합니다.`
  };

  const termsLabels = {
    required: '[필수] 이용약관 동의',
    privacy: '[필수] 개인정보 수집 및 이용 동의',
    location: '[선택] 위치기반서비스 이용약관',
    marketing: '[선택] 이벤트・혜택 정보 수신 동의'
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Icon name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원가입 약관 동의</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>서비스 이용을 위해</Text>
          <Text style={styles.title}>약관에 동의해주세요</Text>
        </View>

        <TouchableOpacity
          style={[styles.allCheckContainer, allChecked && styles.allCheckContainerActive]}
          onPress={() => handleAllCheck(!allChecked)}
        >
          <Icon 
            name={allChecked ? "check-circle" : "radio-button-unchecked"} 
            size={24} 
            color={allChecked ? "#4F46E5" : "#9CA3AF"} 
          />
          <Text style={[styles.allCheckText, allChecked && styles.allCheckTextActive]}>
            전체 동의하기
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {Object.entries(termsContent).map(([key, content]) => {
          const termKey = key as TermKey;
          return (
            <View key={key} style={styles.termContainer}>
              <TouchableOpacity
                style={styles.termHeader}
                onPress={() => handleIndividualCheck(termKey)}
              >
                <Icon 
                  name={termsChecked[termKey] ? "check-circle" : "radio-button-unchecked"} 
                  size={20} 
                  color={termsChecked[termKey] ? "#4F46E5" : "#9CA3AF"} 
                />
                <Text style={[styles.termTitle, termsChecked[termKey] && styles.termTitleActive]}>
                  {termsLabels[termKey]}
                </Text>
              </TouchableOpacity>

              <ScrollView
                ref={termsRefs[termKey]}
                style={styles.termContentContainer}
                onScroll={(event) => handleScroll(termKey, event)}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.termContent}>{content}</Text>
              </ScrollView>

              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  스크롤 진행률: {Math.round(scrollProgress[termKey])}%
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${scrollProgress[termKey]}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>※ 전체 동의는 필수 및 선택 정보에 대한 동의를 포함합니다.</Text>
          <Text style={styles.noticeText}>※ 선택 항목에 대한 동의를 거부하실 수 있으며, 동의 거부 시에도 서비스 이용이 가능합니다.</Text>
          <Text style={styles.noticeText}>※ 각 약관의 전체 내용을 스크롤하여 확인하시면 자동으로 동의가 체크됩니다.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!termsChecked.required || !termsChecked.privacy) && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!termsChecked.required || !termsChecked.privacy}
          >
            <Text style={[
              styles.nextButtonText,
              (!termsChecked.required || !termsChecked.privacy) && styles.nextButtonTextDisabled
            ]}>
              다음
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  allCheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  allCheckContainerActive: {
    backgroundColor: '#EBF8FF',
  },
  allCheckText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  allCheckTextActive: {
    color: '#4F46E5',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  termContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  termTitle: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  termTitleActive: {
    color: '#4F46E5',
  },
  termContentContainer: {
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  termContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginLeft: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  noticeContainer: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 4,
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default TermsAgreement; 