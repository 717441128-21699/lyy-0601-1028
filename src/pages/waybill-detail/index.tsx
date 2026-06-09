import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';

const WaybillDetailPage: React.FC = () => {
  const router = useRouter();
  const waybillNo = router.params.waybillNo || '';

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.container}>
        <Text className={styles.icon}>📋</Text>
        <Text className={styles.title}>运单详情功能</Text>
        <Text className={styles.description}>
          运单号: {waybillNo || '未指定'}
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

export default WaybillDetailPage;
