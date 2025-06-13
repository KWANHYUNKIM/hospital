import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

interface InformationPost {
  id: number;
  title: string;
  date: string;
  image: string;
  summary: string;
}

const InformationSection = () => {
  const informationPosts: InformationPost[] = [
    {
      id: 1,
      title: "2025년 2월 2째주 응급실 선정 병원 안내",
      date: "2025-02-10",
      image: "https://via.placeholder.com/300x200",
      summary: "이번 주 응급실 선정 병원은 OO병원, XX의료원 등입니다.",
    },
    {
      id: 2,
      title: "의료기관 운영시간 최신 업데이트",
      date: "2025-02-05",
      image: "https://via.placeholder.com/300x200",
      summary: "최근 각 의료기관의 운영시간이 업데이트 되었습니다.",
    },
    {
      id: 3,
      title: "겨울철 응급실 이용 가이드",
      date: "2025-01-28",
      image: "https://via.placeholder.com/300x200",
      summary: "겨울철 응급실 이용 시 알아두면 좋은 정보들을 안내드립니다.",
    },
  ];

  const handlePostPress = (postId: number) => {
    // TODO: 상세 페이지로 이동
    console.log(`Post ${postId} 선택됨`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>정보성 글</Text>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {informationPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.card}
              onPress={() => handlePostPress(post.id)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: post.image }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {post.title}
                </Text>
                <Text style={styles.cardDate}>{post.date}</Text>
                <Text style={styles.cardSummary} numberOfLines={3}>
                  {post.summary}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    paddingHorizontal: 4,
  },
  scrollContainer: {
    maxHeight: 600,
  },
  grid: {
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardSummary: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default InformationSection; 