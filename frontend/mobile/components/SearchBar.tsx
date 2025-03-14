import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar as PaperSearchbar } from 'react-native-paper';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search", value, onChangeText }) => {
  return (
    <PaperSearchbar
      placeholder={placeholder}
      onChangeText={onChangeText}
      value={value}
      style={styles.searchBar}
      inputStyle={styles.searchInput}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20,
    width: '90%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInput: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SearchBar;
