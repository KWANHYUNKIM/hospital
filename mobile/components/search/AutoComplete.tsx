import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface AutoCompleteProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="병원, 약국을 검색해보세요..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});

export default AutoComplete; 