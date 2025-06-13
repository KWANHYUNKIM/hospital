import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';

// TypeScript 인터페이스 정의
interface Disease {
  name: string;
  description: string;
}

interface SeasonalDisease {
  season: string;
  diseases: Disease[];
  color: string;
  bgColor: string;
}

interface HealthTip {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface MedicalInfoSectionProps {
  showSeasonalDiseases?: boolean;
  showHealthTips?: boolean;
}

const MedicalInfoSection: React.FC<MedicalInfoSectionProps> = ({
  showSeasonalDiseases = true,
  showHealthTips = true
}) => {
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  // 계절별 주의 질병 데이터
  const seasonalDiseases: SeasonalDisease[] = [
    {
      season: '봄',
      diseases: [
        { 
          name: '꽃가루 알레르기', 
          description: '봄철 꽃가루로 인한 알레르기성 비염과 결막염이 증가합니다.' 
        },
        { 
          name: '수족구병', 
          description: '3-5월에 주로 발생하는 바이러스성 질환입니다.' 
        }
      ],
      color: '#10B981',
      bgColor: '#DCFCE7'
    },
    {
      season: '여름',
      diseases: [
        { 
          name: '식중독', 
          description: '고온다습한 환경에서 식중독 발생 위험이 높아집니다.' 
        },
        { 
          name: '열사병', 
          description: '무더운 날씨에 발생하는 열 관련 질환입니다.' 
        }
      ],
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      season: '가을',
      diseases: [
        { 
          name: '독감', 
          description: '가을부터 시작되는 인플루엔자 예방이 필요합니다.' 
        },
        { 
          name: '천식', 
          description: '기온 변화가 큰 시기 천식 증상이 악화될 수 있습니다.' 
        }
      ],
      color: '#F97316',
      bgColor: '#FFEDD5'
    },
    {
      season: '겨울',
      diseases: [
        { 
          name: '감기', 
          description: '건조한 날씨와 낮은 기온으로 인한 호흡기 질환입니다.' 
        },
        { 
          name: '심근경색', 
          description: '추운 날씨에 혈관 수축으로 인한 심장 질환 위험이 증가합니다.' 
        }
      ],
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    }
  ];

  // 건강 팁 데이터
  const healthTips: HealthTip[] = [
    {
      title: '수분 섭취',
      description: '하루 8잔의 물을 마시는 것이 좋습니다.',
      icon: '💧',
      color: '#06B6D4'
    },
    {
      title: '규칙적인 운동',
      description: '주 3회 이상, 30분 이상의 운동을 권장합니다.',
      icon: '🏃',
      color: '#10B981'
    },
    {
      title: '충분한 수면',
      description: '하루 7-8시간의 수면이 필요합니다.',
      icon: '😴',
      color: '#8B5CF6'
    },
    {
      title: '균형 잡힌 식사',
      description: '다양한 영양소를 골고루 섭취하세요.',
      icon: '🥗',
      color: '#EF4444'
    }
  ];

  // 계절별 질병 카드 렌더링
  const renderSeasonalDiseaseCard = ({ item }: { item: SeasonalDisease }) => (
    <TouchableOpacity
      style={[styles.seasonCard, { backgroundColor: item.bgColor }]}
      onPress={() => setSelectedSeason(
        selectedSeason === item.season ? '' : item.season
      )}
      activeOpacity={0.7}
    >
      <View style={styles.seasonHeader}>
        <Text style={[styles.seasonTitle, { color: item.color }]}>
          {item.season}
        </Text>
        <Text style={[styles.seasonIcon, { color: item.color }]}>
          {selectedSeason === item.season ? '▲' : '▼'}
        </Text>
      </View>
      
      {selectedSeason === item.season && (
        <View style={styles.diseaseList}>
          {item.diseases.map((disease, index) => (
            <View key={index} style={styles.diseaseItem}>
              <Text style={[styles.diseaseName, { color: item.color }]}>
                • {disease.name}
              </Text>
              <Text style={styles.diseaseDescription}>
                {disease.description}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  // 건강 팁 카드 렌더링
  const renderHealthTipCard = ({ item }: { item: HealthTip }) => (
    <View style={styles.healthTipCard}>
      <View style={[styles.healthTipIconContainer, { backgroundColor: `${item.color}20` }]}>
        <Text style={styles.healthTipIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.healthTipTitle}>{item.title}</Text>
      <Text style={styles.healthTipDescription}>{item.description}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>주요 의료 정보</Text>
        
        {/* 계절별 주의 질병 */}
        {showSeasonalDiseases && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계절별 주의 질병</Text>
            <Text style={styles.sectionSubtitle}>
              계절에 따라 주의해야 할 질병들을 확인하세요
            </Text>
            
            <FlatList
              data={seasonalDiseases}
              renderItem={renderSeasonalDiseaseCard}
              keyExtractor={(item) => item.season}
              numColumns={2}
              columnWrapperStyle={styles.seasonRow}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* 건강 팁 */}
        {showHealthTips && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>건강 팁</Text>
            <Text style={styles.sectionSubtitle}>
              일상에서 실천할 수 있는 건강 관리 방법들
            </Text>
            
            <FlatList
              data={healthTips}
              renderItem={renderHealthTipCard}
              keyExtractor={(item) => item.title}
              numColumns={2}
              columnWrapperStyle={styles.healthTipRow}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    margin: 16,
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  seasonRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seasonCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seasonIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  diseaseList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  diseaseItem: {
    marginBottom: 12,
  },
  diseaseName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  diseaseDescription: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  healthTipRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  healthTipCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  healthTipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthTipIcon: {
    fontSize: 24,
  },
  healthTipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  healthTipDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default MedicalInfoSection; 
export default MedicalInfoSection; 