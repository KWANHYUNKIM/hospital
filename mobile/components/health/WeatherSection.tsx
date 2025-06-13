import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { fetchLatestWeather } from '../../utils/api';

// TypeScript 인터페이스 정의
interface WeatherItem {
  _id?: string;
  category: string;
  obsrValue: string;
}

interface WeatherCurrent {
  temp: number;
  sky: string;
  diffFromYesterday: number;
  desc: string;
  feelsLike: number;
  humidity: number;
  wind?: {
    speed: number;
  };
}

interface WeatherHourly {
  time: string;
  temp: number;
  sky: string;
}

interface WeatherDaily {
  date: string;
  weekday: string;
  min: number;
  max: number;
  morningPop: number;
  afternoonPop: number;
}

interface WeatherMetadata {
  sidoNm?: string;
  sgguNm?: string;
}

interface WeatherData {
  metadata?: WeatherMetadata;
  current?: WeatherCurrent;
  hourly?: WeatherHourly[];
  daily?: WeatherDaily[];
  items?: WeatherItem[];
}

type WeatherTab = 'today' | 'tomorrow' | 'dayAfter' | 'monthly' | 'past';

interface WeatherIconProps {
  skyCode: string;
  size?: number;
}

// 날씨 아이콘 매핑
const WeatherIcon: React.FC<WeatherIconProps> = ({ skyCode, size = 48 }) => {
  const iconMap: { [key: string]: string } = {
    '1': '☀️', // 맑음
    '3': '⛅', // 구름많음  
    '4': '🌧️', // 흐림(비)
  };

  return (
    <Text style={[styles.weatherIcon, { fontSize: size }]}>
      {iconMap[skyCode] || '☀️'}
    </Text>
  );
};

const WeatherSection: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedTab, setSelectedTab] = useState<WeatherTab>('today');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLatestWeather();
      setWeatherData(data);
    } catch (err) {
      console.error('날씨 데이터 로딩 오류:', err);
      setError('날씨 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'today' as WeatherTab, label: '오늘' },
    { key: 'tomorrow' as WeatherTab, label: '내일' },
    { key: 'dayAfter' as WeatherTab, label: '모레' },
    { key: 'monthly' as WeatherTab, label: '월간' },
    { key: 'past' as WeatherTab, label: '과거' },
  ];

  const weatherServices = ['기상청', '아큐웨더', '웨더채널', '웨더뉴스'];

  // 구조 분해 할당에 기본값 추가
  const {
    metadata = {},
    current = {},
    hourly = [],
    daily = [],
    items = []
  } = weatherData || {};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>날씨 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWeatherData}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // current가 없고 items만 있을 때 fallback UI
  if (!current || Object.keys(current).length === 0) {
    if (items.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>날씨 데이터가 없습니다.</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>원시 날씨 데이터</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item._id || item.category}
          renderItem={({ item }) => (
            <View style={styles.rawDataItem}>
              <Text style={styles.rawDataCategory}>{item.category}</Text>
              <Text style={styles.rawDataValue}>{item.obsrValue}</Text>
            </View>
          )}
        />
      </View>
    );
  }

  const { sidoNm = '-', sgguNm = '-' } = metadata;

  // 시간별 예보 렌더링
  const renderHourlyItem = ({ item }: { item: WeatherHourly }) => (
    <View style={styles.hourlyItem}>
      <Text style={styles.hourlyTime}>{item.time}</Text>
      <WeatherIcon skyCode={item.sky} size={24} />
      <Text style={styles.hourlyTemp}>{item.temp}°</Text>
    </View>
  );

  // 일간 예보 렌더링
  const renderDailyItem = ({ item }: { item: WeatherDaily }) => (
    <View style={styles.dailyItem}>
      <View style={styles.dailyLeft}>
        <Text style={styles.dailyWeekday}>{item.weekday}</Text>
        <Text style={styles.dailyDate}>{item.date}</Text>
      </View>
      <Text style={styles.dailyPop}>
        {item.morningPop}% / {item.afternoonPop}%
      </Text>
      <View style={styles.dailyTemp}>
        <Text style={styles.dailyTempMin}>{item.min}°</Text>
        <Text style={styles.dailyTempMax}>{item.max}°</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 및 탭 */}
      <View style={styles.header}>
        <Text style={styles.locationTitle}>{sidoNm} {sgguNm}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 서비스 선택 버튼 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.servicesContainer}
      >
        {weatherServices.map((service) => (
          <TouchableOpacity key={service} style={styles.serviceButton}>
            <Text style={styles.serviceButtonText}>{service}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.compareButton}>
          <Text style={styles.compareButtonText}>예보비교</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 오늘 날씨 요약 카드 */}
      <View style={styles.currentWeatherCard}>
        <View style={styles.currentWeatherMain}>
          <WeatherIcon skyCode={current.sky} size={60} />
          <Text style={styles.currentTemp}>{current.temp}°</Text>
        </View>
        <Text style={styles.currentDescription}>
          어제보다 {current.diffFromYesterday > 0
            ? `+${current.diffFromYesterday}°`
            : `${current.diffFromYesterday}°`} / {current.desc}
        </Text>
        <View style={styles.currentDetails}>
          <View style={styles.currentDetailItem}>
            <Text style={styles.currentDetailIcon}>🌡️</Text>
            <Text style={styles.currentDetailText}>체감 {current.feelsLike}°</Text>
          </View>
          <View style={styles.currentDetailItem}>
            <Text style={styles.currentDetailIcon}>💧</Text>
            <Text style={styles.currentDetailText}>습도 {current.humidity}%</Text>
          </View>
          <View style={styles.currentDetailItem}>
            <Text style={styles.currentDetailIcon}>💨</Text>
            <Text style={styles.currentDetailText}>{current.wind?.speed}m/s</Text>
          </View>
        </View>
      </View>

      {/* 미세먼지·자외선·일몰 카드 */}
      <View style={styles.additionalInfoGrid}>
        <View style={[styles.infoCard, { backgroundColor: '#EBF8FF' }]}>
          <Text style={styles.infoLabel}>미세먼지</Text>
          <Text style={[styles.infoValue, { color: '#3B82F6' }]}>좋음</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: '#EBF8FF' }]}>
          <Text style={styles.infoLabel}>초미세먼지</Text>
          <Text style={[styles.infoValue, { color: '#3B82F6' }]}>좋음</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: '#F0FDF4' }]}>
          <Text style={styles.infoLabel}>자외선</Text>
          <Text style={[styles.infoValue, { color: '#10B981' }]}>보통</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: '#FFFBEB' }]}>
          <Text style={styles.infoLabel}>일몰</Text>
          <Text style={styles.infoValue}>19:37</Text>
        </View>
      </View>

      {/* 시간별 예보 (오늘) */}
      {selectedTab === 'today' && hourly.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시간별 예보</Text>
          <FlatList
            data={hourly}
            renderItem={renderHourlyItem}
            keyExtractor={(item) => item.time}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.hourlyList}
          />
        </View>
      )}

      {/* 주간 예보 */}
      {(selectedTab === 'today' || selectedTab === 'monthly') && daily.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>주간예보</Text>
            <Text style={styles.sectionSubtitle}>최저 최고 기준</Text>
          </View>
          <FlatList
            data={daily}
            renderItem={renderDailyItem}
            keyExtractor={(item) => item.date}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    margin: 16,
  },
  rawDataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rawDataCategory: {
    fontSize: 14,
    color: '#374151',
  },
  rawDataValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  header: {
    padding: 16,
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  servicesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  serviceButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  compareButton: {
    marginLeft: 'auto',
  },
  compareButtonText: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  currentWeatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentWeatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherIcon: {
    marginRight: 8,
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
  },
  currentDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  currentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  currentDetailItem: {
    alignItems: 'center',
  },
  currentDetailIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  currentDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  additionalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoCard: {
    width: '23%',
    marginRight: '2.66%',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  hourlyList: {
    paddingLeft: 16,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  hourlyTime: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 4,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dailyLeft: {
    flex: 1,
  },
  dailyWeekday: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dailyDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  dailyPop: {
    fontSize: 10,
    color: '#3B82F6',
    marginHorizontal: 8,
  },
  dailyTemp: {
    alignItems: 'flex-end',
  },
  dailyTempMin: {
    fontSize: 12,
    color: '#6B7280',
  },
  dailyTempMax: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default WeatherSection; 