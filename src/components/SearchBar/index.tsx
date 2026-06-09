import React, { useState } from 'react';
import { View, Input, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  showScan?: boolean;
  onScan?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '请输入运单号',
  onSearch,
  showScan = true,
  onScan
}) => {
  const [value, setValue] = useState('');

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value.trim());
    } else {
      Taro.showToast({
        title: '请输入运单号',
        icon: 'none'
      });
    }
  };

  const handleScan = () => {
    if (onScan) {
      onScan();
    }
  };

  return (
    <View className={styles.searchBar}>
      <View className={styles.searchInputWrapper}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onInput={(e) => setValue(e.detail.value)}
          onConfirm={handleSearch}
          confirmType="search"
        />
        {value && (
          <Text
            className={styles.clearIcon}
            onClick={() => setValue('')}
          >
            ✕
          </Text>
        )}
      </View>
      <Button className={styles.searchBtn} onClick={handleSearch}>
        查询
      </Button>
      {showScan && (
        <Button className={styles.scanBtn} onClick={handleScan}>
          <Text className={styles.scanIcon}>📷</Text>
        </Button>
      )}
    </View>
  );
};

export default SearchBar;
