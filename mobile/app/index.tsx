import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppTour from '../components/guide/AppTour';
import AutoComplete from '../components/search/AutoComplete';
import MedicalGuideSlider from '../components/guide/MedicalGuideSlider';
import NursingHospitalBannerSlider from '../components/nursing/NursingHospitalBannerSlider';
import MedicalInfoSection from '../components/guide/MedicalInfoSection';
import DownloadSection from '../components/DownloadSection';

const MainPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 첫 방문 시 자동 투어 실행 */}
        <AppTour />

        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>삐뽀삐뽀119</Text>
            <Text style={styles.subtitle}>
              당신의 근처에서 운영 중인 병원을 쉽게 찾아보세요
            </Text>
            <View style={styles.searchContainer}>
              <AutoComplete searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </View>
          </View>
        </View>

        {/* 메인 컨텐츠 */}
        <View style={styles.mainContent}>
          
          {/* 다운로드 섹션 */}
          <View style={styles.section}>
            <DownloadSection />
          </View>
          
          {/* 주요 의료 정보 섹션 */}
          <View style={styles.section}>
            <MedicalInfoSection />
          </View>

          {/* 의료 가이드 슬라이더 섹션 */}
          <View style={styles.section}>
            <MedicalGuideSlider />
          </View>

          {/* 요양병원 배너 슬라이더 */}
          <View style={styles.section}>
            <NursingHospitalBannerSlider />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4f46e5',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  searchContainer: {
    width: '100%',
    marginTop: 8,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 32,
  },
});

export default MainPage; 