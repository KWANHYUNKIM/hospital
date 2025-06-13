import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// TypeScript 인터페이스 정의
interface Schedule {
  [key: string]: string;
}

interface HospitalCardProps {
  id?: string;
  name: string;
  location: string;
  phone: string;
  services: string[];
  schedule?: Schedule;
  onPress?: () => void;
}

const HospitalCard: React.FC<HospitalCardProps> = ({ 
  id,
  name, 
  location, 
  phone, 
  services, 
  schedule,
  onPress 
}) => {
  const navigation = useNavigation();

  // 현재 요일 가져오기
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // 오늘의 운영 시간 가져오기 (기본값 처리)
  const currentHours = schedule?.[today] || "운영 시간 정보 없음";

  // 운영 여부 확인
  const isOpen = currentHours !== "휴무" && currentHours !== "운영 시간 정보 없음";

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (id) {
      navigation.navigate('HospitalDetail' as never, { hospitalId: id } as never);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardBody}>
        <Text style={styles.hospitalName} numberOfLines={2}>{name}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText} numberOfLines={2}>{location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📞</Text>
            <Text style={styles.infoText}>{phone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏥</Text>
            <Text style={styles.infoText} numberOfLines={2}>
              {services.join(', ')}
            </Text>
          </View>
        </View>

        {/* 운영 시간 */}
        {schedule && (
          <>
            <Text style={styles.scheduleTitle}>운영 시간:</Text>
            <View style={styles.scheduleContainer}>
              {Object.entries(schedule)
                .slice(0, 3) // 처음 3개만 표시
                .map(([day, hours]) => (
                  <View key={day} style={styles.scheduleRow}>
                    <Text style={styles.scheduleDay}>{day}:</Text>
                    <Text style={styles.scheduleHours}>{hours}</Text>
                  </View>
                ))}
              {Object.keys(schedule).length > 3 && (
                <Text style={styles.moreSchedule}>외 {Object.keys(schedule).length - 3}일</Text>
              )}
            </View>
          </>
        )}

        {/* 운영 상태 */}
        <View style={[
          styles.statusContainer,
          isOpen ? styles.openStatus : styles.closedStatus
        ]}>
          <Text style={[
            styles.statusText,
            isOpen ? styles.openStatusText : styles.closedStatusText
          ]}>
            {isOpen ? `현재 운영 중 (${currentHours})` : "현재 휴무"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBody: {
    padding: 16,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 24,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  scheduleContainer: {
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scheduleDay: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  scheduleHours: {
    fontSize: 12,
    color: '#374151',
    flex: 2,
  },
  moreSchedule: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  statusContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  openStatus: {
    backgroundColor: '#D1FAE5',
  },
  closedStatus: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  openStatusText: {
    color: '#065F46',
  },
  closedStatusText: {
    color: '#991B1B',
  },
});

export default HospitalCard; 