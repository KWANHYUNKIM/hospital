import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 타입 정의
interface NursingHospital {
  id: number;
  name: string;
  address: string;
  facilities: string[];
  rating: number;
  image: string;
}

const NursingHospitalSection: React.FC = () => {
  const navigation = useNavigation();

  const nursingHospitals: NursingHospital[] = [
    {
      id: 1,
      name: "서울요양병원",
      address: "서울특별시 강남구",
      facilities: ["물리치료", "작업치료", "재활치료", "요양실"],
      rating: 4.5,
      image: "https://placehold.co/300x200/3b82f6/ffffff?text=Seoul+Nursing"
    },
    {
      id: 2,
      name: "부산요양병원",
      address: "부산광역시 해운대구",
      facilities: ["물리치료", "작업치료", "요양실", "휴게실"],
      rating: 4.3,
      image: "https://placehold.co/300x200/10b981/ffffff?text=Busan+Nursing"
    },
    {
      id: 3,
      name: "대구요양병원",
      address: "대구광역시 수성구",
      facilities: ["물리치료", "작업치료", "요양실", "식사실"],
      rating: 4.4,
      image: "https://placehold.co/300x200/f59e0b/ffffff?text=Daegu+Nursing"
    }
  ];

  const handleHospitalPress = (hospitalId: number) => {
    navigation.navigate('NursingHospitalDetail' as never, { id: hospitalId.toString() } as never);
  };

  const handleViewMore = () => {
    navigation.navigate('NursingHospitals' as never);
  };

  const renderHospitalItem = ({ item }: { item: NursingHospital }) => (
    <TouchableOpacity
      style={styles.hospitalCard}
      onPress={() => handleHospitalPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.hospitalImage}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.rating}점</Text>
        </View>
      </View>
      
      <View style={styles.hospitalContent}>
        <Text style={styles.hospitalName}>{item.name}</Text>
        <Text style={styles.hospitalAddress}>{item.address}</Text>
        
        <View style={styles.facilitiesContainer}>
          {item.facilities.map((facility, index) => (
            <View key={index} style={styles.facilityBadge}>
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>요양병원 안내</Text>
        <Text style={styles.sectionDescription}>
          전문적인 요양과 치료를 제공하는 요양병원을 찾아보세요
        </Text>
      </View>

      <FlatList
        data={nursingHospitals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHospitalItem}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.hospitalsList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={handleViewMore}
          activeOpacity={0.8}
        >
          <Text style={styles.viewMoreButtonText}>더 많은 요양병원 보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  hospitalsList: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 16,
  },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 192,
  },
  hospitalImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  hospitalContent: {
    padding: 20,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  facilityText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  viewMoreButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NursingHospitalSection; 