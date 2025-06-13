import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface SgguData {
  sggu: string;
  hospitalCount: number;
  pharmacyCount: number;
}

interface SgguSummaryTableProps {
  summarySggu: SgguData[];
}

const SgguSummaryTable: React.FC<SgguSummaryTableProps> = ({ summarySggu }) => {
  if (!summarySggu || summarySggu.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>시군구별 병원/약국 개수</Text>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* 테이블 헤더 */}
        <View style={styles.headerRow}>
          <Text style={[styles.cell, styles.headerCell, styles.sgguCell]}>시군구</Text>
          <Text style={[styles.cell, styles.headerCell, styles.countCell]}>🏥 병원</Text>
          <Text style={[styles.cell, styles.headerCell, styles.countCell]}>💊 약국</Text>
        </View>
        
        {/* 테이블 바디 */}
        {summarySggu.map((sggu, index) => (
          <View 
            key={sggu.sggu} 
            style={[
              styles.dataRow, 
              index === summarySggu.length - 1 && styles.lastRow
            ]}
          >
            <Text style={[styles.cell, styles.sgguCell]}>{sggu.sggu}</Text>
            <Text style={[styles.cell, styles.countCell, styles.hospitalCount]}>
              {sggu.hospitalCount}
            </Text>
            <Text style={[styles.cell, styles.countCell, styles.pharmacyCount]}>
              {sggu.pharmacyCount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 16,
    maxHeight: '40%',
    minWidth: 320,
    zIndex: 50,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  scrollContainer: {
    maxHeight: 200,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 8,
    marginBottom: 4,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cell: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 13,
  },
  sgguCell: {
    flex: 2,
    textAlign: 'left',
  },
  countCell: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  hospitalCount: {
    color: '#dc2626', // rose-600
  },
  pharmacyCount: {
    color: '#059669', // emerald-600
  },
});

export default SgguSummaryTable; 