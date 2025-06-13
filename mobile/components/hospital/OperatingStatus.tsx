import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

// TypeScript 인터페이스 정의
interface OperatingTimes {
  trmtMonStart?: string | number;
  trmtMonEnd?: string | number;
  trmtTueStart?: string | number;
  trmtTueEnd?: string | number;
  trmtWedStart?: string | number;
  trmtWedEnd?: string | number;
  trmtThuStart?: string | number;
  trmtThuEnd?: string | number;
  trmtFriStart?: string | number;
  trmtFriEnd?: string | number;
  trmtSatStart?: string | number;
  trmtSatEnd?: string | number;
  noTrmtSun?: string;
  lunchWeek?: string;
}

interface OperatingStatusProps {
  times?: OperatingTimes | string;
}

interface StatusInfo {
  status: string;
  statusClass: string;
  statusColor: string;
  backgroundColor: string;
}

const OperatingStatus: React.FC<OperatingStatusProps> = ({ times }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [rotateAnim] = useState(new Animated.Value(0));

  // times가 문자열인 경우 JSON으로 파싱
  let parsedTimes: OperatingTimes | null = null;
  if (typeof times === 'string') {
    try {
      parsedTimes = JSON.parse(times);
    } catch (error) {
      console.error('운영시간 파싱 오류:', error);
    }
  } else {
    parsedTimes = times || null;
  }

  // times 정보가 없으면 메시지만 표시
  if (!parsedTimes) {
    return (
      <View style={styles.unavailableContainer}>
        <Text style={styles.unavailableText}>영업시간 정보 없음</Text>
      </View>
    );
  }

  // 요일 관련 변수
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayKoreanMap: { [key: string]: string } = {
    Sunday: "일요일",
    Monday: "월요일",
    Tuesday: "화요일",
    Wednesday: "수요일",
    Thursday: "목요일",
    Friday: "금요일",
    Saturday: "토요일",
  };

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const today = dayOfWeek[now.getDay()];

  // 문자열을 분 단위 숫자로 변환 (예: "0900" → 540)
  const timeToMinutes = (timeStr: string | number | undefined): number | null => {
    if (!timeStr || timeStr === "-" || timeStr === "정보 없음") return null;
    // 숫자형이면 문자열로 변환
    const strTime = String(timeStr);
    // 3자리 시간을 4자리로 변환 (예: 930 -> 0930)
    const paddedTime = strTime.padStart(4, "0");
    const hour = parseInt(paddedTime.slice(0, 2), 10);
    const minute = parseInt(paddedTime.slice(2, 4), 10);
    return hour * 60 + minute;
  };

  // 숫자형/문자열 시간을 "HH:MM" 형식으로 포맷팅
  const formatTime = (timeStr: string | number | undefined): string => {
    if (!timeStr || timeStr === "-" || timeStr === "정보 없음") return "정보 없음";
    // 숫자형이면 문자열로 변환
    const strTime = String(timeStr);
    // 3자리 시간을 4자리로 변환 (예: 930 -> 0930)
    const paddedTime = strTime.padStart(4, "0");
    return `${paddedTime.slice(0, 2)}:${paddedTime.slice(2, 4)}`;
  };

  const nowInMinutes = currentHour * 60 + currentMinute;
  
  // 현재 요일에 맞는 시작/종료 시간 가져오기
  const getTodaySchedule = () => {
    const dayMap: { [key: string]: { start: keyof OperatingTimes | null; end: keyof OperatingTimes | null } } = {
      Monday: { start: "trmtMonStart", end: "trmtMonEnd" },
      Tuesday: { start: "trmtTueStart", end: "trmtTueEnd" },
      Wednesday: { start: "trmtWedStart", end: "trmtWedEnd" },
      Thursday: { start: "trmtThuStart", end: "trmtThuEnd" },
      Friday: { start: "trmtFriStart", end: "trmtFriEnd" },
      Saturday: { start: "trmtSatStart", end: "trmtSatEnd" },
      Sunday: { start: null, end: null }
    };

    const daySchedule = dayMap[today];
    if (!daySchedule || !daySchedule.start || !daySchedule.end) {
      return { openTime: null, closeTime: null };
    }

    const openTime = parsedTimes![daySchedule.start];
    const closeTime = parsedTimes![daySchedule.end];

    // 데이터가 없거나 "-"인 경우 null 반환
    if (!openTime || !closeTime || openTime === "-" || closeTime === "-") {
      return { openTime: null, closeTime: null };
    }

    return { openTime, closeTime };
  };

  const todaySchedule = getTodaySchedule();
  const openTime = timeToMinutes(todaySchedule.openTime);
  const closeTime = timeToMinutes(todaySchedule.closeTime);

  // 브레이크타임 파싱
  let lunchStart: number | null = null;
  let lunchEnd: number | null = null;
  if (parsedTimes.lunchWeek) {
    const lunchTimes = parsedTimes.lunchWeek.split("~");
    lunchStart = timeToMinutes(lunchTimes[0]);
    lunchEnd = timeToMinutes(lunchTimes[1]);
  }

  // 상태 계산
  const getStatusInfo = (): StatusInfo => {
    // 일요일인 경우
    if (today === "Sunday") {
      if (parsedTimes!.noTrmtSun === "휴무") {
        return {
          status: "휴무일 ❌",
          statusClass: "closed",
          statusColor: "#991B1B",
          backgroundColor: "#FEE2E2"
        };
      } else {
        return {
          status: "알수 없음",
          statusClass: "unknown",
          statusColor: "#1D4ED8",
          backgroundColor: "#EBF8FF"
        };
      }
    }
    // 평일/토요일인 경우
    else if (openTime !== null && closeTime !== null) {
      if (nowInMinutes >= openTime && nowInMinutes < closeTime) {
        if (
          lunchStart !== null &&
          lunchEnd !== null &&
          nowInMinutes >= lunchStart &&
          nowInMinutes < lunchEnd
        ) {
          return {
            status: "브레이크타임 🍽️",
            statusClass: "break",
            statusColor: "#D97706",
            backgroundColor: "#FEF3C7"
          };
        } else {
          return {
            status: "영업 중 ✅",
            statusClass: "open",
            statusColor: "#065F46",
            backgroundColor: "#D1FAE5"
          };
        }
      } else {
        return {
          status: "영업 종료 ❌",
          statusClass: "closed",
          statusColor: "#991B1B",
          backgroundColor: "#FEE2E2"
        };
      }
    } else {
      return {
        status: "알수 없음",
        statusClass: "unknown",
        statusColor: "#1D4ED8",
        backgroundColor: "#EBF8FF"
      };
    }
  };

  const statusInfo = getStatusInfo();

  const toggleDetails = () => {
    const toValue = showDetails ? 0 : 1;
    setShowDetails(!showDetails);
    
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.statusButton,
          { backgroundColor: statusInfo.backgroundColor }
        ]}
        onPress={toggleDetails}
        activeOpacity={0.7}
      >
        <Text style={[styles.statusText, { color: statusInfo.statusColor }]}>
          {statusInfo.status}
        </Text>
        <Animated.Text
          style={[
            styles.dropdownIcon,
            { color: statusInfo.statusColor, transform: [{ rotate: rotateInterpolate }] }
          ]}
        >
          ▼
        </Animated.Text>
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.detailsContainer}>
          {dayOfWeek.map((day) => {
            const dayMap: { [key: string]: { start: keyof OperatingTimes | null; end: keyof OperatingTimes | null } } = {
              Monday: { start: "trmtMonStart", end: "trmtMonEnd" },
              Tuesday: { start: "trmtTueStart", end: "trmtTueEnd" },
              Wednesday: { start: "trmtWedStart", end: "trmtWedEnd" },
              Thursday: { start: "trmtThuStart", end: "trmtThuEnd" },
              Friday: { start: "trmtFriStart", end: "trmtFriEnd" },
              Saturday: { start: "trmtSatStart", end: "trmtSatEnd" },
              Sunday: { start: null, end: null }
            };

            const daySchedule = dayMap[day];
            const startTime = daySchedule?.start ? parsedTimes![daySchedule.start] : null;
            const endTime = daySchedule?.end ? parsedTimes![daySchedule.end] : null;

            return (
              <View key={day} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{dayKoreanMap[day]}</Text>
                {day === "Sunday" ? (
                  <Text style={styles.dayTime}>{parsedTimes!.noTrmtSun || "알수 없음"}</Text>
                ) : startTime && endTime && startTime !== "-" && endTime !== "-" ? (
                  <Text style={styles.dayTime}>
                    {formatTime(startTime)} ~ {formatTime(endTime)}
                  </Text>
                ) : (
                  <Text style={styles.dayTime}>알수 없음</Text>
                )}
              </View>
            );
          })}
          {parsedTimes.lunchWeek && (
            <View style={styles.lunchSection}>
              <View style={styles.dayRow}>
                <Text style={styles.dayLabel}>점심시간</Text>
                <Text style={styles.dayTime}>{parsedTimes.lunchWeek}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  unavailableContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  unavailableText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    minWidth: 120,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  dropdownIcon: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  dayTime: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    textAlign: 'right',
  },
  lunchSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
    paddingTop: 8,
  },
});

export default OperatingStatus; 