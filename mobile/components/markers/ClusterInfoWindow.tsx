import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';

// 타입 정의
interface Hospital {
  yadmNm: string;
  clCdNm?: string;
  addr?: string;
  [key: string]: any;
}

interface Pharmacy {
  yadmNm: string;
  addr?: string;
  [key: string]: any;
}

interface ClusterDetails {
  hospitals?: Hospital[];
  pharmacies?: Pharmacy[];
}

interface Cluster {
  details?: ClusterDetails;
  [key: string]: any;
}

interface ClusterInfoWindowProps {
  cluster: Cluster | null;
  onHospitalClick: (hospital: Hospital) => void;
  onPharmacyClick: (pharmacy: Pharmacy) => void;
  onClose: () => void;
  visible: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ClusterInfoWindow: React.FC<ClusterInfoWindowProps> = ({
  cluster,
  onHospitalClick,
  onPharmacyClick,
  onClose,
  visible,
}) => {
  if (!cluster) return null;

  const { hospitals = [], pharmacies = [] } = cluster.details || {};

  const renderHospitalItem = (hospital: Hospital, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.listItem}
      onPress={() => onHospitalClick(hospital)}
      activeOpacity={0.7}
    >
      <Text style={styles.facilityName}>{hospital.yadmNm}</Text>
      {hospital.clCdNm && (
        <Text style={styles.categoryText}>{hospital.clCdNm}</Text>
      )}
      {hospital.addr && (
        <Text style={styles.addressText}>{hospital.addr}</Text>
      )}
    </TouchableOpacity>
  );

  const renderPharmacyItem = (pharmacy: Pharmacy, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.listItem}
      onPress={() => onPharmacyClick(pharmacy)}
      activeOpacity={0.7}
    >
      <Text style={styles.facilityName}>{pharmacy.yadmNm}</Text>
      {pharmacy.addr && (
        <Text style={styles.addressText}>{pharmacy.addr}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>병원 정보</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {hospitals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  병원 ({hospitals.length}개)
                </Text>
                <View style={styles.listContainer}>
                  {hospitals.map(renderHospitalItem)}
                </View>
              </View>
            )}

            {pharmacies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  약국 ({pharmacies.length}개)
                </Text>
                <View style={styles.listContainer}>
                  {pharmacies.map(renderPharmacyItem)}
                </View>
              </View>
            )}

            {hospitals.length === 0 && pharmacies.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  표시할 의료시설 정보가 없습니다.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  listContainer: {
    marginBottom: 16,
  },
  listItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ClusterInfoWindow; 