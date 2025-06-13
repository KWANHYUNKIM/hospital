import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

// 타입 정의
interface Position {
  latitude: number;
  longitude: number;
}

interface ClusterDetails {
  hospitals?: any[];
  pharmacies?: any[];
  [key: string]: any;
}

interface Cluster {
  clusterCount?: number;
  details?: ClusterDetails;
  [key: string]: any;
}

interface ClusterMarkerProps {
  position: Position;
  cluster: Cluster;
  onClusterPress?: (cluster: Cluster, position: Position) => void;
  zoomLevel?: number;
  isSelected?: boolean;
}

const ClusterMarker: React.FC<ClusterMarkerProps> = ({
  position,
  cluster,
  onClusterPress = () => {},
  zoomLevel = 10,
  isSelected = false,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);

  // 클러스터 카운트 계산
  const clusterCount = useMemo(() => {
    if (cluster.clusterCount) return cluster.clusterCount;
    
    const hospitals = cluster.details?.hospitals?.length || 0;
    const pharmacies = cluster.details?.pharmacies?.length || 0;
    return Math.max(hospitals + pharmacies, 1);
  }, [cluster]);

  // 마커 크기 계산 (클러스터 개수에 따라 동적 조정)
  const markerSize = useMemo(() => {
    const baseSize = 36;
    const scaleFactor = Math.min(clusterCount * 1.5, 12);
    return Math.min(baseSize + scaleFactor, 60);
  }, [clusterCount]);

  // 폰트 크기 계산
  const fontSize = useMemo(() => {
    const baseFontSize = 12;
    const scaleFactor = Math.min(clusterCount / 10, 4);
    return Math.min(baseFontSize + scaleFactor, 18);
  }, [clusterCount]);

  // 선택된 상태나 눌린 상태에 따른 스타일
  const markerStyle = useMemo(() => {
    const baseStyle = {
      width: markerSize,
      height: markerSize,
      borderRadius: markerSize / 2,
      backgroundColor: isSelected ? '#FF7043' : '#FF5252',
      borderWidth: isSelected ? 3 : 2,
      borderColor: '#FFFFFF',
    };

    return isPressed
      ? {
          ...baseStyle,
          backgroundColor: '#FF7043',
          transform: [{ scale: 1.1 }],
        }
      : baseStyle;
  }, [markerSize, isSelected, isPressed]);

  // 애니메이션 효과
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected, scaleAnim]);

  // 마커 클릭 처리
  const handlePress = () => {
    onClusterPress(cluster, position);
  };

  // 터치 시작 처리
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  };

  // 터치 종료 처리
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      useNativeDriver: true,
    }).start();
  };

  // 클러스터 개수 표시 텍스트 (1000 이상일 때 간소화)
  const displayCount = useMemo(() => {
    if (clusterCount >= 1000) {
      return `${Math.floor(clusterCount / 1000)}k`;
    }
    return clusterCount.toString();
  }, [clusterCount]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={styles.touchableContainer}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View
        style={[
          styles.markerContainer,
          markerStyle,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text
          style={[
            styles.clusterText,
            { fontSize },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {displayCount}
        </Text>
      </Animated.View>

      {/* 선택된 상태일 때 추가 표시 */}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <View style={styles.selectedDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Android 그림자
  },
  clusterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false, // Android에서 폰트 패딩 제거
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -8,
    alignItems: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ClusterMarker; 