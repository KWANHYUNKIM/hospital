import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

// 타입 정의
export interface PlaylistItem {
  id: number;
  emoji: string;
  title: string;
}

const playlistItems: PlaylistItem[] = [
  { id: 1, emoji: '🌱', title: '아침을 여는 명상음악' },
  { id: 2, emoji: '🎧', title: '집중력 향상 BGM' },
  { id: 3, emoji: '💤', title: '숙면을 위한 자연의 소리' },
];

const RecommendPlaylist: React.FC = () => {
  const renderPlaylistItem = (item: PlaylistItem) => (
    <View key={item.id} style={styles.playlistItem}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.playlistTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>추천 플레이리스트</Text>
      <View style={styles.playlistContainer}>
        {playlistItems.map(renderPlaylistItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  playlistContainer: {
    gap: 8,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  playlistTitle: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
});

export default RecommendPlaylist; 