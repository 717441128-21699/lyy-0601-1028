import React from 'react';
import { View, Image, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxCount?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onChange,
  maxCount = 9
}) => {
  const handleChooseImage = () => {
    const remaining = maxCount - photos.length;
    if (remaining <= 0) {
      Taro.showToast({
        title: `最多上传${maxCount}张`,
        icon: 'none'
      });
      return;
    }

    Taro.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPhotos = [...photos, ...res.tempFilePaths];
        onChange(newPhotos);
      },
      fail: (err) => {
        console.error('[PhotoUpload] chooseImage failed:', err);
      }
    });
  };

  const handleDelete = (index: number) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const newPhotos = photos.filter((_, i) => i !== index);
          onChange(newPhotos);
        }
      }
    });
  };

  return (
    <View className={styles.photoUpload}>
      <View className={styles.photoList}>
        {photos.map((photo, index) => (
          <View key={index} className={styles.photoItem}>
            <Image
              className={styles.photoImg}
              src={photo}
              mode="aspectFill"
            />
            <View
              className={styles.deleteBtn}
              onClick={() => handleDelete(index)}
            >
              <Text className={styles.deleteIcon}>✕</Text>
            </View>
          </View>
        ))}
        {photos.length < maxCount && (
          <Button className={styles.addBtn} onClick={handleChooseImage}>
            <Text className={styles.addIcon}>+</Text>
          </Button>
        )}
      </View>
      <Text className={styles.photoHint}>
        支持上传货物破损、单证等照片（最多{maxCount}张）
      </Text>
    </View>
  );
};

export default PhotoUpload;
