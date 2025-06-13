import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Linking 
} from 'react-native';

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  icon: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <Text style={styles.icon}>{icon}</Text>
    <View style={styles.infoContent}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

interface InfoSidebarProps {
  info: any;
  onClose: () => void;
  visible: boolean;
}

const InfoSidebar: React.FC<InfoSidebarProps> = ({ info, onClose, visible }) => {
  if (!info) return null;

  // 병원/약국 구분
  const isHospital = !!info.yadmNm;

  // 진료과/운영시간 등 문자열 변환
  const majorStr = info.major && Array.isArray(info.major) ? info.major.join(', ') : '';
  const openHours = info.openHours || info.operatingHours || info.hours || '';

  const handleUrlPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>상세 정보</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView style={styles.content}>
            <InfoRow 
              label="이름" 
              value={info.yadmNm || info.name} 
              icon={isHospital ? '🏥' : '💊'} 
            />
            
            {isHospital && info.clCdNm && (
              <InfoRow label="분류" value={info.clCdNm} icon="🏷️" />
            )}
            
            {!isHospital && info.clCdNm && (
              <InfoRow label="분류" value={info.clCdNm} icon="🏷️" />
            )}
            
            {info.addr && (
              <InfoRow label="주소" value={info.addr} icon="📍" />
            )}
            
            {info.telno && (
              <InfoRow label="전화번호" value={info.telno} icon="📞" />
            )}
            
            {isHospital && info.beds && (
              <InfoRow label="병상 수" value={info.beds} icon="🛏️" />
            )}
            
            {isHospital && info.doctors && (
              <InfoRow label="의사 수" value={info.doctors} icon="👨‍⚕️" />
            )}
            
            {isHospital && info.nurses && (
              <InfoRow label="간호사 수" value={info.nurses} icon="👩‍⚕️" />
            )}
            
            {isHospital && info.category && (
              <InfoRow label="카테고리" value={info.category} icon="🏷️" />
            )}
            
            {isHospital && info.major && info.major.length > 0 && (
              <InfoRow label="진료과" value={majorStr} icon="🩺" />
            )}
            
            {isHospital && info.hospUrl && (
              <View style={styles.infoRow}>
                <Text style={styles.icon}>🔗</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>홈페이지</Text>
                  <TouchableOpacity onPress={() => handleUrlPress(info.hospUrl)}>
                    <Text style={styles.linkText}>{info.hospUrl}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {isHospital && (
              <>
                {typeof info.nightCare !== 'undefined' && (
                  <InfoRow 
                    label="야간진료" 
                    value={info.nightCare ? '가능' : '불가'} 
                    icon="🌙" 
                  />
                )}
                {typeof info.weekendCare !== 'undefined' && (
                  <InfoRow 
                    label="주말진료" 
                    value={info.weekendCare ? '가능' : '불가'} 
                    icon="📅" 
                  />
                )}
              </>
            )}
            
            {/* 약국 특화 정보 */}
            {!isHospital && openHours && (
              <InfoRow label="운영시간" value={openHours} icon="⏰" />
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
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});

export default InfoSidebar; 