import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';

const SubscriptionDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || '';

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.container}>
        <Text className={styles.icon}>🚢</Text>
        <Text className={styles.title}>船期详情功能</Text>
        <Text className={styles.description}>
          订阅ID: {id || '未指定'}
          {'\n'}
          该功能正在开发中，敬请期待！
        </Text>
        <Button className={styles.backBtn} onClick={handleBack}>
          返回上一页
        </Button>
      </View>
    </ScrollView>
  );
};

export default SubscriptionDetailPage;
