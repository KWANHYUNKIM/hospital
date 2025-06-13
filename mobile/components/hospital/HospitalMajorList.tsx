import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

// TypeScript 인터페이스 정의
interface HospitalMajorListProps {
  majors?: string[];
  maxDisplay?: number;
  showTitle?: boolean;
}

const HospitalMajorList: React.FC<HospitalMajorListProps> = ({ 
  majors, 
  maxDisplay = 10,
  showTitle = true 
}) => {
  if (!majors || majors.length === 0) {
    return (
      <View style={styles.container}>
        {showTitle && (
          <Text style={styles.title}>진료과:</Text>
        )}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>진료과 정보 없음</Text>
        </View>
      </View>
    );
  }

  // 표시할 진료과 목록 (최대 개수 제한)
  const displayMajors = majors.slice(0, maxDisplay);
  const remainingCount = majors.length - maxDisplay;

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={styles.title}>진료과:</Text>
      )}
      <View style={styles.majorContainer}>
        {displayMajors.map((major, index) => (
          <View key={`${major}-${index}`} style={styles.majorChip}>
            <Text style={styles.majorText}>{major}</Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.majorChip, styles.remainingChip]}>
            <Text style={[styles.majorText, styles.remainingText]}>
              +{remainingCount}개 더
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  majorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  majorChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  remainingChip: {
    backgroundColor: '#E5E7EB',
  },
  majorText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  remainingText: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  emptyContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default HospitalMajorList; 